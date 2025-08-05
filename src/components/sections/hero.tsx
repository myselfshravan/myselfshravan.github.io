"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Github, FileText, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import portfolioData from "@/lib/portfolio-data.json";

export function Hero() {
  const [text, setText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = `${portfolioData.personal.name
    .toLowerCase()
    .replace(" ", "_")}@portfolio:~$ whoami`;

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(cursorTimer);
    };
  }, [fullText]);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero-section min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Terminal-style background grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl">
        <div className="text-center space-y-8">
          {/* Terminal Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-muted/20 backdrop-blur-sm border border-muted/40 rounded-lg p-6 font-mono text-left max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-muted/20">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs text-muted-foreground">
                terminal
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="text-green-400">
                {text}
                <span
                  className={`${
                    showCursor ? "opacity-100" : "opacity-0"
                  } transition-opacity`}
                >
                  |
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="text-muted-foreground"
              >
                {portfolioData.personal.description}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.5 }}
                className="text-muted-foreground pt-2"
              >
                Currently @ <span className="text-primary">udaanCapital</span> |
                150+ projects shipped
              </motion.div>
            </div>
          </motion.div>

          {/* Bio Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-lg text-muted-foreground leading-relaxed">
              {portfolioData.personal.bio}
            </p>
          </motion.div>

          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-6 max-w-md mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">150+</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2K+</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4+</div>
              <div className="text-sm text-muted-foreground">Years</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => scrollToSection("#projects")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
            >
              <Terminal className="mr-2 h-4 w-4" />
              view projects
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                window.open(portfolioData.writing.blog_url, "_blank")
              }
              className="px-6 py-3 border-primary/20 hover:bg-primary/5"
            >
              <FileText className="mr-2 h-4 w-4" />
              read blog
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(portfolioData.social.github, "_blank")}
              className="px-6 py-3 border-primary/20 hover:bg-primary/5"
            >
              <Github className="mr-2 h-4 w-4" />
              source code
            </Button>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex justify-center gap-6 text-sm text-muted-foreground"
          >
            <button
              onClick={() => scrollToSection("#projects")}
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              projects
            </button>
            <button
              onClick={() => scrollToSection("#work")}
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              work
            </button>
            <button
              onClick={() => scrollToSection("#contact")}
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              contact
            </button>
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
          onClick={() => scrollToSection("#projects")}
          className="rounded-full hover:bg-primary/10"
        >
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
        </Button>
      </motion.div>
    </section>
  );
}
