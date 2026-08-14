import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { getUserId } from './analytics';

/**
 * Access keys live in Firestore collection `access_keys`, one doc per key.
 * Doc id = the key. Shape (created in the admin dashboard):
 *   { id, key, page, name, createdAt, visits: [{ userId, timestamp, referrer }] }
 *
 * `page` binds a key to a single report slug; a key for `klydo_pitch` cannot
 * open `sherlock_report`.
 *
 * The portfolio reads these docs publicly from the browser (same posture as
 * `portfolio_user_mapping`). Keys are not enumerable without knowing them.
 */

export const ACCESS_KEYS_COLLECTION = 'access_keys';

export interface AccessCheckResult {
  ok: boolean;
  /** Recipient/source label from the key doc, when ok. */
  name?: string;
  reason?: 'missing' | 'wrong_page' | 'no_db' | 'invalid_format';
}

/**
 * Validate an access key for a given report. On success, records a visit
 * (with referrer so external-share vs portfolio-nav opens are distinguishable)
 * onto the key doc.
 *
 * Mirrors the visit-recording pattern in `hash-utils.ts:lookupHashMapping`, but
 * treats a missing doc as DENY (access control), whereas lookupHashMapping
 * treats null as "still record the organic visit".
 */
export async function checkAccess(
  key: string | null | undefined,
  slug: string,
): Promise<AccessCheckResult> {
  if (!key || !db) return { ok: false, reason: !key ? 'invalid_format' : 'no_db' };

  const trimmed = key.trim();
  if (!/^[a-zA-Z0-9_-]{3,40}$/.test(trimmed)) {
    return { ok: false, reason: 'invalid_format' };
  }

  try {
    const ref = doc(db, ACCESS_KEYS_COLLECTION, trimmed);
    const snap = await getDoc(ref);

    if (!snap.exists()) return { ok: false, reason: 'missing' };

    const data = snap.data() as { page?: string; name?: string };
    if (data.page !== slug) return { ok: false, reason: 'wrong_page' };

    // Record the visit. Mirrors the permissive update posture used by
    // portfolio_user_mapping (Firestore rule should ideally restrict updates
    // to the `visits` field only).
    const userId = getUserId() ?? 'anonymous';
    try {
      await updateDoc(ref, {
        visits: arrayUnion({
          userId,
          timestamp: Timestamp.now(),
          referrer: typeof document !== 'undefined' ? document.referrer || null : null,
        }),
      });
    } catch {
      // Visit log write failed; don't block the viewer. The PostHog event
      // still captures the view.
    }

    return { ok: true, name: data.name };
  } catch {
    return { ok: false, reason: 'missing' };
  }
}
