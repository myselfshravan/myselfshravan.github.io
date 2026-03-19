'use client';

import { useEffect, useRef, useCallback } from 'react';
import posthog from 'posthog-js';

/**
 * Tracks time spent in a section and fires events for:
 * - section_viewed: when section becomes visible (>30% in viewport for 1s)
 * - section_time_spent: when section leaves viewport, with duration
 *
 * Usage: const ref = useSectionTracker('about');
 *        <section ref={ref} id="about">...</section>
 */
export function useSectionTracker(sectionName: string) {
  const ref = useRef<HTMLElement>(null);
  const entryTime = useRef<number | null>(null);
  const hasViewed = useRef(false);
  const visibilityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Start a 1s timer to confirm it's not just scrolling past
          if (!visibilityTimer.current) {
            visibilityTimer.current = setTimeout(() => {
              entryTime.current = Date.now();
              if (!hasViewed.current) {
                hasViewed.current = true;
                posthog.capture('section_viewed', { section: sectionName });
              }
            }, 1000);
          }
        } else {
          // Clear timer if user scrolled past before 1s
          if (visibilityTimer.current) {
            clearTimeout(visibilityTimer.current);
            visibilityTimer.current = null;
          }

          // Fire time_spent if they actually viewed it
          if (entryTime.current) {
            const duration = Math.round((Date.now() - entryTime.current) / 1000);
            if (duration >= 2) {
              posthog.capture('section_time_spent', {
                section: sectionName,
                duration_seconds: duration,
              });
            }
            entryTime.current = null;
          }
        }
      });
    },
    [sectionName],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.3,
    });

    observer.observe(el);

    // Fire time_spent on page unload if section is still visible
    const handleUnload = () => {
      if (entryTime.current) {
        const duration = Math.round((Date.now() - entryTime.current) / 1000);
        if (duration >= 2) {
          posthog.capture('section_time_spent', {
            section: sectionName,
            duration_seconds: duration,
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      observer.disconnect();
      window.removeEventListener('beforeunload', handleUnload);
      if (visibilityTimer.current) {
        clearTimeout(visibilityTimer.current);
      }
      // Fire on unmount too
      handleUnload();
    };
  }, [sectionName, handleIntersect]);

  return ref;
}
