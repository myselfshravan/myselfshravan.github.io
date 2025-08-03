"use client"

import React, { useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Code2, Wrench, Heart, Gamepad2, Headphones, Laptop, BookOpen, Palette, Route } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import portfolioData from "@/lib/portfolio-data.json"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const hobbyIcons = {
  "fa-headphones": Headphones,
  "fa-laptop-code": Laptop,
  "fa-book-open": BookOpen,
  "fa-gamepad": Gamepad2,
  "fa-palette": Palette,
  "fa-route": Route,
}

export function Skills() {
  const sectionRef = useRef<HTMLElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  useEffect(() => {
    if (typeof window !== "undefined" && skillsRef.current) {
      const skillBadges = skillsRef.current.querySelectorAll(".skill-badge")
      
      gsap.fromTo(
        skillBadges,
        { scale: 0, rotation: 180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: skillsRef.current,
            start: "top 80%",
          },
        }
      )
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  const skillCategories = [
    {
      title: "Languages & Frameworks",
      icon: Code2,
      skills: portfolioData.skills.languages,
      gradient: "from-blue-500/10 to-purple-500/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Tools & Technologies",
      icon: Wrench,
      skills: portfolioData.skills.tools,
      gradient: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-500",
    },
  ]

  return (
    <section
      id="skills"
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
              Skills
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Technologies and tools I work with to bring ideas to life
          </p>
        </motion.div>

        {/* Technical Skills */}
        <motion.div
          ref={skillsRef}
          className="grid md:grid-cols-2 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {skillCategories.map((category) => {
            const Icon = category.icon
            return (
              <motion.div key={category.title} variants={itemVariants}>
                <Card className={`bg-gradient-to-br ${category.gradient} border-muted/20 hover:shadow-lg transition-all duration-300 h-full`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="p-2 bg-background/50 rounded-lg">
                        <Icon className={`h-6 w-6 ${category.iconColor}`} />
                      </div>
                      <span>{category.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {category.skills.map((skill) => (
                        <motion.div
                          key={skill.name}
                          className="skill-badge"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge
                            variant="secondary"
                            className="px-4 py-2 text-sm font-medium bg-background/80 hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <i className={`devicon-${skill.icon}-original mr-2 text-base`} />
                            {skill.name}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Hobbies & Interests */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Hobbies &{" "}
              <span className="bg-gradient-to-r from-secondary to-secondary/60 bg-clip-text text-transparent">
                Interests
              </span>
            </h3>
            <p className="text-muted-foreground">
              When I&apos;m not coding, you&apos;ll find me doing these things
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {portfolioData.hobbies.map((hobby, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm border-muted/20 group-hover:bg-primary/5">
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        {(() => {
                          const IconComponent = hobbyIcons[hobby.icon as keyof typeof hobbyIcons] || Heart
                          return <IconComponent className="h-6 w-6 text-primary" />
                        })()}
                      </div>
                      <p className="text-sm font-medium text-center leading-relaxed">
                        {hobby.text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Fun Fact */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20">
            <CardContent className="p-0">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Gamepad2 className="h-8 w-8 text-primary" />
                <h4 className="text-xl font-bold">Fun Fact</h4>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                I&apos;ve built over <span className="font-bold text-primary">180 full-stack projects</span> and 
                still get excited about each new challenge. My secret? I treat every project like a 
                game level to complete! 🎮
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}