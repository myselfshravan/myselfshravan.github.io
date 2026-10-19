'use client';

import { useEffect, useRef, useCallback } from 'react';
import posthog from 'posthog-js';
import { engagedMsSince, onResumeFromIdle } from '@/lib/user-activity';

// A section counts as "in view" when 30% of it is visible OR it fills 30% of
// the viewport. The second rule matters for sections taller than ~3.3
// viewports (Projects on mobile), which can never reach a 30% ratio.
const VISIBLE_FRACTION = 0.3;
const OBSERVER_THRESHOLDS = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5, 0.75, 1];

function isSectionInView(entry: IntersectionObserverEntry): boolean {
  if (!entry.isIntersecting) return false;
  if (entry.intersectionRatio >= VISIBLE_FRACTION) return true;
  const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;
  return entry.intersectionRect.height >= viewportHeight * VISIBLE_FRACTION;
}

/**
 * Tracks time spent in a section and fires events for:
 * - section_viewed: when section becomes visible (30% of it, or 30% of the
 *   viewport, for 1s)
 * - section_time_spent: when section leaves viewport, with duration
 *
 * Pauses the timer when the tab is hidden (fixes inflated durations from
 * users switching tabs while a section is in view) and while the visitor is
 * idle (a tab left open on a visible section is not time spent reading it).
 */
export function useSectionTracker(sectionName: string) {
  const ref = useRef<HTMLElement>(null);
  const entryTime = useRef<number | null>(null);
  const accumulatedTime = useRef<number>(0);
  const hasViewed = useRef(false);
  const visibilityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInViewport = useRef(false);

  const flushTime = useCallback(() => {
    if (entryTime.current === null) return;
    const elapsed = Math.round(engagedMsSince(entryTime.current) / 1000);
    accumulatedTime.current += elapsed;
    entryTime.current = null;
  }, []);

  const fireSectionTimeSpent = useCallback((isUnloading = false) => {
    // Flush any running timer
    if (entryTime.current !== null) {
      flushTime();
    }
    const duration = accumulatedTime.current;
    if (duration >= 2) {
      posthog.capture(
        'section_time_spent',
        {
          section: sectionName,
          duration_seconds: duration,
        },
        // posthog-js flushes its queue on its own pagehide listener, which runs
        // before this one, so unload-time events must be beaconed directly.
        isUnloading ? { transport: 'sendBeacon', send_instantly: true } : undefined,
      );
    }
    accumulatedTime.current = 0;
  }, [sectionName, flushTime]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (isSectionInView(entry)) {
          isInViewport.current = true;
          // Start a 1s timer to confirm it's not just scrolling past
          if (!visibilityTimer.current) {
            visibilityTimer.current = setTimeout(() => {
              // Only start timing if tab is visible
              if (!document.hidden) {
                entryTime.current = Date.now();
              }
              if (!hasViewed.current) {
                hasViewed.current = true;
                posthog.capture('section_viewed', { section: sectionName });
              }
            }, 1000);
          }
        } else {
          // Several thresholds fire while the section is partly visible; only
          // act on the transition out of view.
          if (!isInViewport.current && !visibilityTimer.current) return;
          isInViewport.current = false;
          // Clear timer if user scrolled past before 1s
          if (visibilityTimer.current) {
            clearTimeout(visibilityTimer.current);
            visibilityTimer.current = null;
          }

          // Fire time_spent when section leaves viewport
          fireSectionTimeSpent();
        }
      });
    },
    [sectionName, fireSectionTimeSpent],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: OBSERVER_THRESHOLDS,
    });

    observer.observe(el);

    // Pause/resume timer when tab visibility changes
    const handleVisibilityChange = () => {
      if (!isInViewport.current) return;

      if (document.hidden) {
        // Tab hidden: pause the timer by flushing elapsed into accumulated
        flushTime();
      } else {
        // Tab visible again: restart the clock
        if (hasViewed.current) {
          entryTime.current = Date.now();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Visitor came back after idling: close the segment where idling began
    // and restart the clock from now.
    const unsubscribeIdle = onResumeFromIdle((idleStartedAt) => {
      if (entryTime.current === null) return;
      accumulatedTime.current += Math.max(
        0,
        Math.round((idleStartedAt - entryTime.current) / 1000),
      );
      entryTime.current = Date.now();
    });

    // Fire time_spent on page unload if section is still visible. `pagehide`
    // (not `beforeunload`) because mobile Safari never fires beforeunload.
    const handleUnload = () => {
      if (isInViewport.current) {
        fireSectionTimeSpent(true);
      }
    };

    window.addEventListener('pagehide', handleUnload);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleUnload);
      unsubscribeIdle();
      if (visibilityTimer.current) {
        clearTimeout(visibilityTimer.current);
      }
      // Fire on unmount too
      if (isInViewport.current) {
        fireSectionTimeSpent();
      }
    };
  }, [sectionName, handleIntersect, flushTime, fireSectionTimeSpent]);

  return ref;
}
