import posthog from 'posthog-js';
import { getUserId } from './analytics';

const KNOWN_CHANNELS = new Set([
  'instagram', 'linkedin', 'twitter', 'x',
  'facebook', 'reddit', 'youtube', 'tiktok',
  'github', 'email', 'resume', 'whatsapp',
  'google', 'bing', 'organic', 'qr',
  'hackernews', 'hn', 'producthunt',
  'telegram', 'discord', 'slack',
  'referral', 'direct', 'other',
]);

export function isChannel(source: string): boolean {
  return KNOWN_CHANNELS.has(source.toLowerCase());
}

/**
 * Links the ?s= tracker hash and firebase_user_id to PostHog identity.
 * Must be called BEFORE any posthog.capture() calls.
 *
 * Always calls posthog.identify() with the firebase userId so every
 * visitor gets a person profile with firebase_user_id attached.
 *
 * - Person hash (e.g., "deepika"): sets tracker_hash as person property.
 * - Channel hash (e.g., "instagram"): sets traffic_source as super property.
 */
export function identifyForPostHog(source?: string): void {
  const userId = getUserId();

  // Always identify with firebase userId — creates person profile for every visitor
  if (userId) {
    const personProps: Record<string, string> = {
      firebase_user_id: userId,
    };
    const personPropsOnce: Record<string, string> = {
      first_visit_at: new Date().toISOString(),
    };

    // Parse the tracker hash
    const hasValidSource = source && /^[a-zA-Z0-9]{3,20}$/.test(source);
    const normalized = hasValidSource ? source!.toLowerCase().trim() : null;

    if (normalized) {
      personProps.tracker_hash = normalized;
      personProps.last_visit_at = new Date().toISOString();
      personPropsOnce.first_tracker_hash = normalized;

      // Attach tracker_hash to every event in this session
      posthog.register({ tracker_hash: normalized });

      if (isChannel(normalized)) {
        personProps.traffic_source = normalized;
        posthog.register({ traffic_source: normalized });
      }
    }

    posthog.identify(userId, personProps, personPropsOnce);
  }
}
