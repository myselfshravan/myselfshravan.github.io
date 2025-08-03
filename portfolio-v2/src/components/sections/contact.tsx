"use client"

import React, { useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Mail, Phone, MapPin, Send, MessageCircle, Github, Linkedin, Instagram, Facebook, Twitter, Youtube } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import portfolioData from "@/lib/portfolio-data.json"
import { gsap } from "gsap"

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
}

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  useEffect(() => {
    if (typeof window !== "undefined" && cardsRef.current) {
      const contactCards = cardsRef.current.querySelectorAll(".contact-card")
      
      gsap.fromTo(
        contactCards,
        { y: 50, opacity: 0, rotationY: 15 },
        {
          y: 0,
          opacity: 1,
          rotationY: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
          },
        }
      )
    }
  }, [])

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: portfolioData.personal.email,
      href: `mailto:${portfolioData.personal.email}`,
      description: "Send me an email",
      gradient: "from-blue-500/10 to-blue-600/10",
      iconColor: "text-blue-500",
    },
    {
      icon: Phone,
      title: "Phone",
      value: portfolioData.personal.phone,
      href: `tel:${portfolioData.personal.phone}`,
      description: "Give me a call",
      gradient: "from-green-500/10 to-green-600/10",
      iconColor: "text-green-500",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "Let's Chat",
      href: `https://wa.me/${portfolioData.personal.phone.replace(/\D/g, '')}`,
      description: "Message on WhatsApp",
      gradient: "from-emerald-500/10 to-emerald-600/10",
      iconColor: "text-emerald-500",
    },
  ]

  return (
    <section
      id="contact"
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
            Get In{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to collaborate? Let's discuss your next project or just have a friendly chat about technology.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div>
                <h3 className="text-2xl font-bold mb-6">Let's Connect</h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  I'm always excited to work on new projects and collaborate with passionate individuals. 
                  Whether you have a project in mind, want to discuss opportunities, or just want to say hello, 
                  I'd love to hear from you!
                </p>
              </div>

              {/* Contact Methods */}
              <div ref={cardsRef} className="space-y-4">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon
                  return (
                    <motion.div
                      key={method.title}
                      className="contact-card"
                      whileHover={{ scale: 1.02, x: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={`bg-gradient-to-r ${method.gradient} border-muted/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer hover:border-primary/30`}>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-background/50 rounded-lg">
                              <Icon className={`h-6 w-6 ${method.iconColor}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{method.title}</h4>
                              <p className="text-sm text-muted-foreground mb-1">{method.description}</p>
                              <a
                                href={method.href}
                                className="text-primary hover:underline font-medium"
                                target={method.href.startsWith('http') ? '_blank' : undefined}
                                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                              >
                                {method.value}
                              </a>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(method.href, method.href.startsWith('http') ? '_blank' : '_self')}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => window.open(`mailto:${portfolioData.personal.email}`, '_self')}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Send Email
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(portfolioData.social.linkedin, '_blank')}
                  className="font-semibold px-8 py-3 rounded-lg border-2 hover:bg-primary/5 transition-all duration-300"
                >
                  <Linkedin className="mr-2 h-5 w-5" />
                  LinkedIn
                </Button>
              </div>
            </motion.div>

            {/* Social Media & Additional Info */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Social Media */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-muted/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <span>Follow Me</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Connect with me on social media for updates, insights, and behind-the-scenes content.
                  </p>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {Object.entries(portfolioData.social).slice(0, 8).map(([platform, url]) => {
                      const Icon = socialIcons[platform as keyof typeof socialIcons] || MessageCircle
                      return (
                        <motion.a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center p-4 bg-muted/20 hover:bg-primary/10 rounded-lg text-center transition-all duration-300 group"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                          <span className="text-xs font-medium capitalize">
                            {platform === 'github2' ? 'GitHub' : platform}
                          </span>
                        </motion.a>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Availability Status */}
              <Card className="p-6 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 border-green-500/20">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-20" />
                    </div>
                    <h4 className="text-lg font-semibold">Available for Work</h4>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    I'm currently open to new opportunities and exciting projects. 
                    Let's create something amazing together!
                  </p>
                </CardContent>
              </Card>

              {/* Fun Fact */}
              <Card className="p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-2xl">⚡</div>
                    <h4 className="text-lg font-semibold">Quick Response</h4>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    I typically respond to emails within 24 hours. For urgent matters, 
                    WhatsApp is the fastest way to reach me!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20">
            <CardContent className="p-0 text-center">
              <h3 className="text-xl font-bold mb-4">Ready to Start a Project?</h3>
              <p className="text-muted-foreground mb-6">
                Let's discuss how we can bring your ideas to life with cutting-edge technology and creative solutions.
              </p>
              <Button
                size="lg"
                onClick={() => window.open(`mailto:${portfolioData.personal.email}?subject=Project Collaboration`, '_self')}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Send className="mr-2 h-5 w-5" />
                Start a Conversation
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}