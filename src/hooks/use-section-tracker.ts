'use client';

import { useEffect, useRef, useCallback } from 'react';
import posthog from 'posthog-js';

/**
 * Tracks time spent in a section and fires events for:
 * - section_viewed: when section becomes visible (>30% in viewport for 1s)
 * - section_time_spent: when section leaves viewport, with duration
 *
 * Pauses the timer when the tab is hidden (fixes inflated durations from
 * users switching tabs while a section is in view).
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
    const elapsed = Math.round((Date.now() - entryTime.current) / 1000);
    accumulatedTime.current += elapsed;
    entryTime.current = null;
  }, []);

  const fireSectionTimeSpent = useCallback(() => {
    // Flush any running timer
    if (entryTime.current !== null) {
      flushTime();
    }
    const duration = accumulatedTime.current;
    if (duration >= 2) {
      posthog.capture('section_time_spent', {
        section: sectionName,
        duration_seconds: duration,
      });
    }
    accumulatedTime.current = 0;
  }, [sectionName, flushTime]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
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
      threshold: 0.3,
    });

    observer.observe(el);

    // Pause/resume timer when tab visibility changes
    const handleVisibilityChange = () => {
      if (!isInViewport.current) return;

      if (document.hidden) {
        // Tab hidden — pause the timer by flushing elapsed into accumulated
        flushTime();
      } else {
        // Tab visible again — restart the clock
        if (hasViewed.current) {
          entryTime.current = Date.now();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Fire time_spent on page unload if section is still visible
    const handleUnload = () => {
      if (isInViewport.current) {
        fireSectionTimeSpent();
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
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
