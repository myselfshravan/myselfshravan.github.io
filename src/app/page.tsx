'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { trackVisit } from '@/lib/analytics';
import { identifyForPostHog } from '@/lib/posthog-identity';
import { Header } from '@/components/layout/header';
import { Hero } from '@/components/sections/hero';
import { Skills } from '@/components/sections/skills';
import { Projects } from '@/components/sections/projects';
import { GitHubSection } from '@/components/sections/github';
import { Writing } from '@/components/sections/writing';
import { Work } from '@/components/sections/work';
import { Contact } from '@/components/sections/contact';
import { Footer } from '@/components/layout/footer';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import posthog from 'posthog-js';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const scrollMilestonesRef = useRef(new Set<number>());
  const sessionStartRef = useRef(Date.now());

  const trackScrollDepth = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const percent = Math.round((scrollTop / docHeight) * 100);

    const milestones = [25, 50, 75, 100];
    for (const milestone of milestones) {
      if (percent >= milestone && !scrollMilestonesRef.current.has(milestone)) {
        scrollMilestonesRef.current.add(milestone);
        posthog.capture('scroll_depth_reached', { depth_percent: milestone });
      }
    }
  }, []);

  useEffect(() => {
    // Check for hash in search params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hash = params.get('s');

      // Identify in PostHog BEFORE any events fire
      identifyForPostHog(hash || undefined);

      // Track visit in Firebase
      trackVisit(hash || undefined);
      // If hash is present, remove it from URL without page reload
      if (hash) {
        window.history.replaceState({}, '', '/');
      }
    }
  }, []); // Run once on mount

  // Scroll depth tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    return () => window.removeEventListener('scroll', trackScrollDepth);
  }, [trackScrollDepth]);

  // Session duration on page unload
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUnload = () => {
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      posthog.capture('session_ended', { duration_seconds: duration });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  useEffect(() => {
    // Initialize smooth scrolling and scroll-triggered animations
    if (typeof window !== 'undefined') {
      // Set up scroll-triggered animations (exclude hero section)
      const sections = document.querySelectorAll('section:not(.hero-section)');

      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0.8 },
          {
            opacity: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });

      // Refresh ScrollTrigger on window resize
      const handleResize = () => {
        ScrollTrigger.refresh();
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="min-h-screen max-w-6xl mx-auto">
      <Header />
      <main className="pt-16">
        <Hero />
        <Writing />
        <Projects />
        <GitHubSection />
        <Skills />
        <Work />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
