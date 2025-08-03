"use client"

import React, { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowDown, Download, Github, Linkedin, Instagram, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import portfolioData from "@/lib/portfolio-data.json"
import { gsap } from "gsap"

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only handle profile image rotation with GSAP
    // Let Framer Motion handle all other animations to avoid conflicts
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
      })
    }
  }, [])

  const handleDownloadResume = () => {
    window.open(`/${portfolioData.personal.resumeFile}`, "_blank")
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      ref={heroRef}
      className="hero-section min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-muted/20"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <motion.h1 
                className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Hi, I&apos;m{" "}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  {portfolioData.personal.name.split(" ")[0]}
                </span>
                <motion.span
                  className="inline-block ml-2"
                  animate={{ rotate: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  👋
                </motion.span>
              </motion.h1>
              
              <motion.div 
                className="hero-subtitle space-y-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-muted-foreground">
                  {portfolioData.personal.subtitle}
                </h2>
                <h3 className="text-lg sm:text-xl text-primary font-medium">
                  {portfolioData.personal.description}
                </h3>
              </motion.div>
            </motion.div>

            <motion.p
              className="hero-description text-lg text-muted-foreground leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {portfolioData.personal.bio}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="hero-buttons flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                size="lg"
                onClick={handleDownloadResume}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Resume
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("#projects")}
                className="font-semibold px-8 py-3 rounded-lg border-2 hover:bg-primary/5 transition-all duration-300"
              >
                View My Work
                <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            {/* Social Links */}
            <motion.div
              className="hero-socials flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <span className="text-sm text-muted-foreground font-medium">Find me on:</span>
              <div className="flex space-x-3">
                {Object.entries(portfolioData.social).slice(0, 4).map(([platform, url]) => {
                  const Icon = socialIcons[platform as keyof typeof socialIcons]
                  if (!Icon) return null
                  
                  return (
                    <motion.a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-300"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Profile Image */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative">
              {/* Animated Border */}
              <div
                ref={imageRef}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-primary p-1 animate-spin-slow"
                style={{ animationDuration: "20s" }}
              >
                <div className="w-full h-full bg-background rounded-full" />
              </div>
              
              {/* Profile Image */}
              <Avatar className="relative w-64 h-64 sm:w-80 sm:h-80 border-4 border-background shadow-2xl">
                <AvatarImage
                  src="/assets/img/profile_5.jpg"
                  alt={portfolioData.personal.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  {portfolioData.personal.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 w-6 h-6 bg-secondary rounded-full"
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scrollToSection("#about")}
          className="rounded-full hover:bg-primary/10"
        >
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
        </Button>
      </motion.div>
    </section>
  )
}