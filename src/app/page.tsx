'use client';

import React, { useEffect } from 'react';
import { trackVisit } from '@/lib/analytics';
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

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  useEffect(() => {
    // Check for hash in search params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hash = params.get('h');

      // Track visit (with hash if present, or as organic)
      trackVisit(hash || undefined);
      // If hash is present, remove it from URL without page reload
      if (hash) {
        window.history.replaceState({}, '', '/');
      }
    }
  }, []); // Run once on mount

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
