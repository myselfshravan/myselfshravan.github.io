"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { Terminal } from "lucide-react";
import portfolioData from "@/lib/portfolio-data.json";

export function Skills() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const skillCategories = [
    {
      title: "Languages",
      icon: "🔧",
      skills: portfolioData.skills.core.map((s) => s.name),
    },
    {
      title: "Frameworks",
      icon: "⚡",
      skills: portfolioData.skills.frameworks.map((s) => s.name),
    },
    {
      title: "Databases",
      icon: "💾",
      skills: portfolioData.skills.databases.map((s) => s.name),
    },
    {
      title: "DevOps",
      icon: "☁️",
      skills: portfolioData.skills.devops.map((s) => s.name),
    },
  ];

  return (
    <section id="skills" ref={sectionRef} className="py-16 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-4 font-mono">
            <span className="text-primary">$</span> skills --list
          </h2>
          <p className="text-muted-foreground">
            Current tech stack for building production systems
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <h3 className="font-mono text-sm font-semibold text-primary uppercase tracking-wider">
                  {category.title}
                </h3>
              </div>
              <div className="space-y-1">
                {category.skills.map((skill) => (
                  <div
                    key={skill}
                    className="text-xs text-muted-foreground font-mono text-center py-1 px-2 bg-muted/20 rounded border border-muted/40 hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-muted-foreground bg-muted/20 px-4 py-2 rounded border border-muted/40">
            <Terminal className="h-3 w-3" />
            <span>Always learning, always building</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
