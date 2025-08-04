"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Code,
  Briefcase,
  GraduationCap,
  Heart,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import portfolioData from "@/lib/portfolio-data.json";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll(".about-card");

      gsap.fromTo(
        cards,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const toggleJobDescription = (index: number) => {
    setExpandedJob(expandedJob === index ? null : index);
  };

  return (
    <section
      id="about"
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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            About{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Me
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get to know more about my journey, experiences, and what drives me
            as a developer.
          </p>
        </motion.div>

        {/* Mobile Layout - Stack all cards vertically */}
        <motion.div
          className="lg:hidden space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* My Story */}
          <motion.div variants={itemVariants}>
            <Card className="about-card p-4 bg-card/50 backdrop-blur-sm border-muted/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">My Story</h3>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  {portfolioData.personal.intro
                    .slice(0, 3)
                    .map((line, index) => (
                      <motion.p
                        key={index}
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: line
                            .replace(
                              /<b><a class="text-blue-500" href="([^"]*)">/g,
                              '<strong><a class="text-primary hover:underline" href="$1" target="_blank">'
                            )
                            .replace(/<\/a><\/b>/g, "</a></strong>"),
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Professional Experience */}
          <motion.div variants={itemVariants}>
            <Card className="about-card p-3 bg-card/50 backdrop-blur-sm border-muted/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    Professional Experience
                  </h3>
                </div>
                <div className="space-y-3">
                  {portfolioData.work.map((job, index) => (
                    <motion.div
                      key={index}
                      className="bg-muted/20 rounded-lg group hover:bg-muted/30 transition-colors duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer"
                        onClick={() => toggleJobDescription(index)}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {job.position}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {job.website && job.website !== "#" ? (
                              <a
                                href={job.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center space-x-1 group-hover:text-primary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>{job.company}</span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </a>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {job.company}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {job.startDate} - {job.endDate}
                          </Badge>
                          {expandedJob === index ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedJob === index && job.description && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-0">
                              <div className="border-t border-muted/30 pt-3">
                                <ul className="space-y-2">
                                  {job.description.map((desc, descIndex) => (
                                    <li
                                      key={descIndex}
                                      className="text-sm text-muted-foreground flex items-start space-x-2"
                                    >
                                      <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                                      <span>{desc}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* What I Do */}
          <motion.div variants={itemVariants}>
            <Card className="about-card p-4 bg-card/50 backdrop-blur-sm border-muted/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">What I Do</h3>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  {portfolioData.personal.intro
                    .slice(3, 7)
                    .map((line, index) => (
                      <motion.p
                        key={index}
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: line
                            .replace(
                              /<a class="text-blue-500 underline" href="([^"]*)">/g,
                              '<a class="text-primary hover:underline font-medium" href="$1" target="_blank">'
                            )
                            .replace(
                              /<a class="text-blue-500 font-bold" href="([^"]*)">/g,
                              '<a class="text-primary hover:underline font-bold" href="$1" target="_blank">'
                            ),
                        }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>

        {/* Desktop Layout - Professional Experience left, others right */}
        <motion.div
          className="hidden lg:grid lg:grid-cols-2 gap-12 items-start"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Left Column - Professional Experience */}
          <motion.div variants={itemVariants}>
            <Card className="about-card p-6 bg-card/50 backdrop-blur-sm border-muted/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    Professional Experience
                  </h3>
                </div>
                <div className="space-y-3">
                  {portfolioData.work.map((job, index) => (
                    <motion.div
                      key={index}
                      className="bg-muted/20 rounded-lg group hover:bg-muted/30 transition-colors duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer"
                        onClick={() => toggleJobDescription(index)}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {job.position}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {job.website && job.website !== "#" ? (
                              <a
                                href={job.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center space-x-1 group-hover:text-primary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>{job.company}</span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </a>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {job.company}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {job.startDate} - {job.endDate}
                          </Badge>
                          {expandedJob === index ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedJob === index && job.description && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-0">
                              <div className="border-t border-muted/30 pt-3">
                                <ul className="space-y-2">
                                  {job.description.map((desc, descIndex) => (
                                    <li
                                      key={descIndex}
                                      className="text-sm text-muted-foreground flex items-start space-x-2"
                                    >
                                      <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                                      <span>{desc}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - My Story, What I Do */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* My Story */}
            <Card className="about-card p-6 bg-card/50 backdrop-blur-sm border-muted/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">My Story</h3>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  {portfolioData.personal.intro
                    .slice(0, 3)
                    .map((line, index) => (
                      <motion.p
                        key={index}
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: line
                            .replace(
                              /<b><a class="text-blue-500" href="([^"]*)">/g,
                              '<strong><a class="text-primary hover:underline" href="$1" target="_blank">'
                            )
                            .replace(/<\/a><\/b>/g, "</a></strong>"),
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* What I Do */}
            <Card className="about-card p-6 bg-card/50 backdrop-blur-sm border-muted/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">What I Do</h3>
                </div>
                <div className="space-y-4 text-muted-foreground">
                  {portfolioData.personal.intro
                    .slice(3, 7)
                    .map((line, index) => (
                      <motion.p
                        key={index}
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: line
                            .replace(
                              /<a class="text-blue-500 underline" href="([^"]*)">/g,
                              '<a class="text-primary hover:underline font-medium" href="$1" target="_blank">'
                            )
                            .replace(
                              /<a class="text-blue-500 font-bold" href="([^"]*)">/g,
                              '<a class="text-primary hover:underline font-bold" href="$1" target="_blank">'
                            ),
                        }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* My Mission */}
        <motion.div className="mt-12 text-center">
          <Card className="about-card p-6 bg-card/50 backdrop-blur-sm border-muted/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">My Mission</h3>
              </div>
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="text-muted-foreground leading-relaxed">
                  {portfolioData.personal.goal}
                </p>
                <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <p className="text-sm text-muted-foreground italic">
                    {
                      portfolioData.personal.intro[
                        portfolioData.personal.intro.length - 1
                      ]
                    }
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { number: "180+", label: "Projects Built" },
            { number: "6", label: "Companies Worked" },
            { number: "3+", label: "Years Experience" },
            { number: "∞", label: "Learning Never Stops" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 bg-card/30 backdrop-blur-sm rounded-lg border border-muted/20 hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="text-3xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
