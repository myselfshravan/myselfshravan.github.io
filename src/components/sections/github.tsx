'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GitHubStats } from '@/components/github/github-stats';

export function GitHubSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="github"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-mono">
            <span className="text-primary">{'>'}</span> github --stats
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A snapshot of my coding journey visualized through GitHub statistics
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Stats update live via a self-hosted API.
            <a
              href="https://github.com/myselfshravan/git-stats-api"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline underline-offset-4 text-primary hover:text-primary/80 transition-colors"
            >
              $ cat api-source
            </a>
          </p>
        </motion.div>

        <GitHubStats />
      </div>
    </section>
  );
}
