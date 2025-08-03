"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Code, Briefcase, GraduationCap, Heart } from "lucide-react";
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

        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-start"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Left Column - Introduction */}
          <motion.div variants={itemVariants} className="space-y-6">
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
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div>
                        <h4 className="font-medium text-foreground">
                          {job.position}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {job.company}
                        </p>
                      </div>
                      <Badge
                        variant={
                          job.status === "Current" ? "default" : "secondary"
                        }
                      >
                        {job.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - More Details */}
          <motion.div variants={itemVariants} className="space-y-6">
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
            { number: "4", label: "Companies Worked" },
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
