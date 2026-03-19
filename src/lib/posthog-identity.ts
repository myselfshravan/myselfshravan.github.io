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
 * Links the ?s= tracker hash to PostHog identity.
 * Must be called BEFORE any posthog.capture() calls.
 *
 * - Person hash (e.g., "deepika"): calls posthog.identify() with
 *   the Firebase userId as distinct_id, sets tracker_hash property.
 * - Channel hash (e.g., "instagram"): registers traffic_source as
 *   a super property on the anonymous user (no identify, cheaper).
 * - Always registers firebase_user_id on every visitor.
 */
export function identifyForPostHog(source?: string): void {
  const userId = getUserId();

  // Always attach firebase_user_id to every event
  if (userId) {
    posthog.register({ firebase_user_id: userId });
  }

  if (!source || !/^[a-zA-Z0-9]{3,20}$/.test(source)) return;

  const normalized = source.toLowerCase().trim();

  // Always attach the tracker hash to every event in this session
  posthog.register({ tracker_hash: normalized });

  if (isChannel(normalized)) {
    // Channel: don't identify, just tag events with source
    posthog.register({ traffic_source: normalized });
  } else {
    // Person: identify so all events link to this person profile
    posthog.identify(
      userId || normalized,
      {
        tracker_hash: normalized,
        firebase_user_id: userId,
        last_visit_at: new Date().toISOString(),
      },
      {
        first_visit_at: new Date().toISOString(),
        first_tracker_hash: normalized,
      },
    );
  }
}
