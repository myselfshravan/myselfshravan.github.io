"use client"

import React, { useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { GraduationCap, Calendar, ExternalLink, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import portfolioData from "@/lib/portfolio-data.json"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function Education() {
  const sectionRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  useEffect(() => {
    if (typeof window !== "undefined" && timelineRef.current) {
      const educationCards = timelineRef.current.querySelectorAll(".education-card")
      
      gsap.fromTo(
        educationCards,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 80%",
          },
        }
      )

      // Animate timeline line
      gsap.fromTo(
        ".timeline-line",
        { height: 0 },
        {
          height: "100%",
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 80%",
          },
        }
      )
    }
  }, [])

  return (
    <section
      id="education"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-muted/20 to-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            My{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Education
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            The academic foundation that shaped my journey in technology
          </p>
          
          {/* Quote */}
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <p className="text-lg italic text-muted-foreground leading-relaxed">
                  &quot;Education is not the learning of facts, but the training of the mind to think.&quot;
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Education Timeline */}
        <div ref={timelineRef} className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary timeline-line" />

          <div className="space-y-12">
            {portfolioData.education.map((edu, index) => (
              <motion.div
                key={index}
                className="education-card relative flex items-start space-x-8"
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GraduationCap className="h-8 w-8 text-primary-foreground" />
                  </motion.div>
                  
                  {/* Timeline connector */}
                  {index < portfolioData.education.length - 1 && (
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-primary/50 to-transparent" />
                  )}
                </div>

                {/* Education Card */}
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-muted/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:border-primary/30">
                    <div className="flex flex-col lg:flex-row">
                      {/* Institution Image */}
                      <div className="lg:w-48 relative">
                        <div className="aspect-video lg:aspect-square relative bg-gradient-to-br from-primary/5 to-secondary/5">
                          <Image
                            src={`/assets/img/${edu.image}`}
                            alt={edu.institution}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 192px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <CardTitle className="text-xl mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                {edu.institution}
                              </CardTitle>
                              <p className="text-muted-foreground font-medium">
                                {edu.degree}
                              </p>
                            </div>
                            <Badge variant="outline" className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{edu.duration}</span>
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>Campus</span>
                            </div>
                            
                            {edu.website && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(edu.website, "_blank")}
                                className="hover:bg-primary/10 transition-colors"
                              >
                                Visit Website
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Academic Achievements */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Academic{" "}
              <span className="bg-gradient-to-r from-secondary to-secondary/60 bg-clip-text text-transparent">
                Highlights
              </span>
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Degree Completed",
                value: "B.E. CSE (AI & ML)",
                icon: "🎓",
                description: "Specialized in AI & Machine Learning"
              },
              {
                title: "Academic Focus",
                value: "Full-Stack Development",
                icon: "💻",
                description: "With AI/ML integration"
              },
              {
                title: "Project Experience",
                value: "180+ Projects",
                icon: "🚀",
                description: "Built during academic journey"
              },
              {
                title: "Industry Ready",
                value: "4 Internships",
                icon: "🏢",
                description: "Real-world experience gained"
              },
            ].map((achievement, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-muted/20 group-hover:bg-primary/5 group-hover:border-primary/30">
                  <CardContent className="p-0">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-lg font-bold text-primary mb-2">
                      {achievement.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}