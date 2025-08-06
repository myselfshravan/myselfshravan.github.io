"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GitHubStatsCard } from "./github-stats-card";
import { githubAccounts, getStatsUrl } from "@/lib/github-config";

export function GitHubStats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={sectionRef}
      className="mt-20"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {githubAccounts.map((account) => (
          <GitHubStatsCard
            key={account.username}
            account={account}
            statsUrl={getStatsUrl(account.username)}
          />
        ))}
      </div>
    </motion.div>
  );
}
