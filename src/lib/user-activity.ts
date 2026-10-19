/**
 * Shared idle detection for engagement timers (section_time_spent,
 * session_ended). A visible tab left open with nobody at it is not
 * engagement, so timers stop counting IDLE_TIMEOUT_MS after the last input
 * and resume on the next one.
 */

export const IDLE_TIMEOUT_MS = 60_000;

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart'];

let lastActivityAt = Date.now();
let tracking = false;
const resumeListeners = new Set<(idleStartedAt: number) => void>();

function markActivity() {
  const now = Date.now();
  const idleStartedAt = lastActivityAt + IDLE_TIMEOUT_MS;
  lastActivityAt = now;
  if (now > idleStartedAt) {
    resumeListeners.forEach((listener) => listener(idleStartedAt));
  }
}

function ensureTracking() {
  if (tracking || typeof window === 'undefined') return;
  tracking = true;
  lastActivityAt = Date.now();
  ACTIVITY_EVENTS.forEach((event) =>
    window.addEventListener(event, markActivity, { passive: true, capture: true }),
  );
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) markActivity();
  });
}

/** Engaged milliseconds from `since` to now, capped at the start of the current idle stretch. */
export function engagedMsSince(since: number): number {
  const end = Math.min(Date.now(), lastActivityAt + IDLE_TIMEOUT_MS);
  return Math.max(0, end - since);
}

/**
 * Calls `listener` with the time idling began whenever input arrives after an
 * idle stretch, so a running timer can close its segment there and restart.
 * Returns an unsubscribe function.
 */
export function onResumeFromIdle(listener: (idleStartedAt: number) => void): () => void {
  ensureTracking();
  resumeListeners.add(listener);
  return () => {
    resumeListeners.delete(listener);
  };
}
