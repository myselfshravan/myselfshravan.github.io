"use client"

import React from "react"
import { motion } from "framer-motion"
import { Heart, ExternalLink, ArrowUp, Github, Linkedin, Instagram, Facebook, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import portfolioData from "@/lib/portfolio-data.json"

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Education", href: "#education" },
    { name: "Contact", href: "#contact" },
  ]

  return (
    <footer className="bg-gradient-to-b from-background to-muted/20 border-t border-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                SHRAVAN
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-md mt-3">
                Thanks for checking out my portfolio website. Connect with me over socials. 
                Feel free to drop a message. I will be glad to help.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Hit me up on{" "}
                <a 
                  href={portfolioData.social.instagram} 
                  target="_blank" 
                  className="text-primary hover:underline font-medium"
                >
                  Instagram
                </a>{" "}
                or if you're the classic type, mail me at{" "}
                <a 
                  href={`mailto:${portfolioData.personal.email}`}
                  className="text-primary hover:underline font-medium"
                >
                  {portfolioData.personal.email}
                </a>
              </p>
            </motion.div>

            <motion.p
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Soon other projects will be listed. It's a work in progress so check back often!
            </motion.p>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href={portfolioData.social.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
                >
                  <span>Blog</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigator.share?.({ 
                    title: 'Shravan Revanna - Portfolio',
                    url: window.location.href
                  })}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  Share
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">Follow Me</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(portfolioData.social).slice(0, 6).map(([platform, url]) => {
                const Icon = socialIcons[platform as keyof typeof socialIcons] || Mail
                return (
                  <motion.a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-muted/20 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                )
              })}
            </div>

            {/* Additional Links */}
            <div className="mt-4 space-y-2">
              <a
                href="https://shravanrevanna.hashnode.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
              >
                <span>Check out blogs on Hashnode</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <motion.div
            className="flex items-center space-x-4 text-sm text-muted-foreground"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="flex items-center">
              Made with <Heart className="h-4 w-4 text-red-500 mx-1 animate-pulse" /> by{" "}
              <span className="font-semibold text-primary ml-1">Shravan Revanna</span>
            </p>
          </motion.div>

          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollToTop}
              className="rounded-full hover:bg-primary/10"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Credits */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-muted-foreground">
            Inspired by "bedimcode" and "inbio" websites. Built with Next.js, TypeScript, Tailwind CSS, 
            Framer Motion, and shadcn/ui.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}