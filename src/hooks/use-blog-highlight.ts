'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import posthog from 'posthog-js';
import portfolioData from '@/lib/portfolio-data.json';
import { getBlogSlug, readBlogParam } from '@/lib/blog-link';

// Fixed header height (matches the offset used by header nav in
// src/components/layout/header.tsx).
const HEADER_OFFSET = 80;

/**
 * Deep-link highlight for blog posts.
 *
 * Reads `?blog=<slug>` from the URL on mount. If the slug matches a featured
 * post (by its derived URL slug), that card is scrolled into view and flagged
 * as highlighted so the UI can ring/pulse it.
 *
 * The highlight PERSISTS for as long as `?blog=` remains in the URL; it does
 * not auto-clear. Because page.tsx preserves the `blog` param, a refresh (or
 * sharing the same URL) re-applies the highlight. If the param is absent or
 * unmatched, nothing happens.
 *
 * Usage:
 *   const { highlightedSlug, registerCard } = useBlogHighlight();
 *   <div ref={registerCard(slug)} />
 */
export function useBlogHighlight() {
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  /** Returns a callback ref that registers/unregisters a card element by slug. */
  const registerCard = useCallback((slug: string) => (el: HTMLElement | null) => {
    if (el) {
      cardRefs.current.set(slug, el);
    } else {
      cardRefs.current.delete(slug);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const slug = readBlogParam();
    if (!slug) return;

    const post = portfolioData.writing.featured_posts.find(
      (p) => getBlogSlug(p.url) === slug,
    );
    if (!post) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // Let layout (and GSAP entrance) settle, then scroll + flag the card.
    const settleTimer = window.setTimeout(() => {
      const el = cardRefs.current.get(slug);
      if (el) {
        // getBoundingClientRect is robust to nested offsetParents (unlike
        // offsetTop, which is relative to the nearest positioned ancestor).
        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({
          top: Math.max(0, top),
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }
      setHighlightedSlug(slug);
      posthog.capture('blog_deep_link_opened', { slug, title: post.title });
    }, 150);

    return () => {
      window.clearTimeout(settleTimer);
    };
  }, []);

  return { highlightedSlug, registerCard };
}
