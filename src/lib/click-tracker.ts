import { trackButtonClick } from './analytics';
import { Timestamp } from 'firebase/firestore';

// Configuration for external API endpoints
const API_CONFIG = {
  VERCEL_API_BASE: 'https://myselfshravan-github-io.vercel.app/api',
};

interface TrackingData {
  category: string;
  identifier: string;
  action: string;
  context?: {
    section: string;
    position?: number;
    url?: string;
    metadata?: Record<string, unknown>;
  };
}

interface QueuedEvent extends TrackingData {
  timestamp: string;
}

interface QueuedCommand {
  type: 'command';
  command: string;
  response?: string;
  commandType: 'terminal' | 'ai';
  timestamp: Timestamp;
}

class ClickTracker {
  private queue: (QueuedEvent | QueuedCommand)[] = [];
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Add global click listener with event delegation
    document.addEventListener('click', this.handleClick);

    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Start periodic sync
    this.startPeriodicSync();

    this.isInitialized = true;
  }

  destroy() {
    if (typeof window === 'undefined') return;

    document.removeEventListener('click', this.handleClick);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isInitialized = false;
  }

  private handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const trackingElement = target.closest('[data-track]') as HTMLElement;

    if (!trackingElement) return;

    try {
      const trackingData = JSON.parse(trackingElement.getAttribute('data-track') || '{}');

      // Always use non-blocking tracking
      this.track(trackingData);

      // For external links, sync immediately to minimize data loss on page unload
      if (trackingData.context?.url && this.isExternalLink(trackingData.context.url)) {
        // Use a small delay to allow current navigation to proceed, then sync
        setTimeout(() => this.syncToFirebase(), 0);
      }
    } catch (error) {
      console.error('Click tracking error:', error);
    }
  };

  private isExternalLink(url: string): boolean {
    try {
      const link = new URL(url);
      return link.hostname !== window.location.hostname;
    } catch {
      return false;
    }
  }

  track(data: TrackingData) {
    const queuedEvent: QueuedEvent = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(queuedEvent);

    // If online and queue is getting large, sync immediately
    if (this.isOnline && this.queue.length >= 10) {
      this.syncToFirebase();
    }
  }

  trackCommand(command: string, response?: string, commandType: 'terminal' | 'ai' = 'terminal') {
    // Only add to queue if command exists and response is not undefined for AI commands
    if (!command || (commandType === 'ai' && response === undefined)) return;

    const queuedCommand: QueuedCommand = {
      type: 'command',
      command,
      response,
      commandType,
      timestamp: Timestamp.now(),
    };

    this.queue.push(queuedCommand);

    // Sync more frequently for commands to ensure they're saved
    if (this.isOnline && this.queue.length >= 3) {
      this.syncToFirebase();
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    // Sync queued events when coming back online
    if (this.queue.length > 0) {
      this.syncToFirebase();
    }
  };

  private handleOffline = () => {
    this.isOnline = false;
  };

  private startPeriodicSync() {
    // Sync every 30 seconds if there are queued events
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.syncToFirebase();
      }
    }, 30000);
  }

  private async syncToFirebase() {
    if (this.queue.length === 0) return;

    // Take current queue and clear it
    const itemsToSync = [...this.queue];
    this.queue = [];

    try {
      // Process items in batches to avoid overwhelming Firebase
      for (const item of itemsToSync) {
        if ('type' in item && item.type === 'command') {
          // Handle command tracking
          await this.syncCommand(item);
        } else {
          // Handle button click tracking
          const event = item as QueuedEvent;
          await trackButtonClick(event.category, event.identifier, event.action, event.context);
        }
      }
    } catch (error) {
      console.error('Firebase sync error:', error);

      // Return failed items to queue for retry (at the beginning)
      this.queue.unshift(...itemsToSync);

      // Limit queue size to prevent memory issues
      if (this.queue.length > 100) {
        this.queue = this.queue.slice(0, 100);
      }
    }
  }

  private async syncCommand(commandItem: QueuedCommand) {
    try {
      const { trackCommand } = await import('./analytics');
      await trackCommand(commandItem.command, commandItem.response, commandItem.commandType);
    } catch (error) {
      console.error('Failed to sync command:', commandItem.command, error);
      throw error; // Re-throw to trigger retry logic
    }
  }

  // Public method to manually sync (useful for page unload)
  async flush() {
    if (this.queue.length > 0) {
      await this.syncToFirebase();
    }
  }
}

// Singleton instance
export const clickTracker = new ClickTracker();

// Non-blocking command tracking function
export function trackCommandNonBlocking(command: string, response?: string, commandType: 'terminal' | 'ai' = 'terminal') {
  clickTracker.trackCommand(command, response, commandType);
}

// Hook for React components
export function useClickTracking() {
  return {
    track: (data: TrackingData) => clickTracker.track(data),
    trackCommand: (command: string, response?: string, commandType: 'terminal' | 'ai' = 'terminal') => clickTracker.trackCommand(command, response, commandType),
    flush: () => clickTracker.flush(),
  };
}

// Helper to create data-track attributes
export function createTrackingData(
  category: string,
  identifier: string,
  action: string,
  context?: {
    section: string;
    position?: number;
    url?: string;
    metadata?: Record<string, unknown>;
  },
): string {
  return JSON.stringify({
    category,
    identifier,
    action,
    context,
  });
}

// External link tracking with sendBeacon for in-app browser reliability
export function trackExternalLink(url: string, title: string) {
  if (typeof window === 'undefined') return;

  const userId =
    typeof localStorage !== 'undefined' ? localStorage.getItem('portfolio_user_id') : null;
  if (!userId) {
    console.warn('No user ID found for external link tracking');
    return;
  }

  const payload = {
    userId,
    url,
    title,
  };

  // 1. Primary: Use sendBeacon with Vercel serverless function (most reliable)
  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'text/plain',
      });
      const success = navigator.sendBeacon(`${API_CONFIG.VERCEL_API_BASE}/track-external`, blob);
      if (success) {
        return;
      }
    } catch (error) {
      console.warn('sendBeacon failed:', error);
    }
  }

  // 2. Fallback that still works during page unloads
  try {
    fetch(`${API_CONFIG.VERCEL_API_BASE}/track-external`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true, // Ensure it works during page unloads
      mode: 'cors', // Use CORS to allow cross-origin requests
    });
    console.log('External link tracked via fetch:', url);
  } catch (error) {
    console.error('External link tracking failed:', error);
  }
}
