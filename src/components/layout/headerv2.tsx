"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "#top" },
  { name: "Projects", href: "#projects" },
  { name: "Writing", href: "#writing" },
  { name: "Work", href: "#work" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

export function HeaderV2() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Active section detection
      const sections = navItems.map((item) => item.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element instanceof HTMLElement) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (href === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.querySelector(href);
    if (element && element instanceof HTMLElement) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({ top: elementPosition, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <style jsx>{`
        .glass-header {
          position: relative;
          overflow: hidden;
          border-radius: 2rem;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
        }

        .glass-filter {
          position: absolute;
          inset: 0;
          z-index: 0;
          backdrop-filter: blur(20px) saturate(180%);
          filter: url(#lg-dist);
          isolation: isolate;
        }

        .glass-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: rgba(255, 255, 255, 0.12);
        }

        [data-theme="dark"] .glass-overlay {
          background: rgba(0, 0, 0, 0.25);
        }

        .glass-specular {
          position: absolute;
          inset: 0;
          z-index: 2;
          border-radius: inherit;
          overflow: hidden;
          box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 0 10px rgba(255, 255, 255, 0.2);
        }

        [data-theme="dark"] .glass-specular {
          box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 0 10px rgba(255, 255, 255, 0.08);
        }

        .glass-content {
          position: relative;
          z-index: 3;
        }

        .nav-item {
          position: relative;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 2.2);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(1.02);
        }

        [data-theme="dark"] .nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        [data-theme="dark"] .nav-item.active {
          background: rgba(255, 255, 255, 0.12);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .mobile-glass-menu {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(30px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        [data-theme="dark"] .mobile-glass-menu {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <motion.header
        className="fixed top-4 left-4 right-4 z-50 flex justify-center"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="glass-header w-full max-w-4xl">
          <div className="glass-filter"></div>
          <div className="glass-overlay"></div>
          <div className="glass-specular"></div>
          
          <div className="glass-content px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <button
                  onClick={() => scrollToSection("#top")}
                  className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hover:scale-105 transition-all duration-300 cursor-pointer"
                  aria-label="Scroll to top"
                >
                  SHRAVAN
                </button>
              </motion.div>

              {/* Desktop Navigation */}
              <motion.nav
                className="hidden md:flex items-center space-x-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {navItems.map((item, index) => {
                  const sectionId = item.href.substring(1);
                  const isActive = activeSection === sectionId;

                  return (
                    <motion.button
                      key={item.name}
                      onClick={() => scrollToSection(item.href)}
                      className={cn(
                        "nav-item px-4 py-2 text-sm font-medium transition-all duration-300",
                        isActive ? "active text-primary" : "text-foreground/80 hover:text-foreground"
                      )}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={`Navigate to ${item.name} section`}
                    >
                      {item.name}
                    </motion.button>
                  );
                })}
                
                <Link
                  href="https://blog.shravanrevanna.me/"
                  target="_blank"
                  className="nav-item px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground flex items-center space-x-1"
                  aria-label="Visit blog (opens in new tab)"
                >
                  <span>Blog</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </motion.nav>

              {/* Theme Toggle & Mobile Menu */}
              <div className="flex items-center space-x-3">
                <div className="nav-item p-2">
                  <ThemeToggle />
                </div>

                {/* Mobile Menu */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden nav-item hover:bg-transparent"
                      aria-label="Open navigation menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="mobile-glass-menu w-[300px] sm:w-[400px] border-0"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Navigation
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="nav-item"
                        aria-label="Close navigation menu"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <nav className="flex flex-col space-y-2">
                      <AnimatePresence>
                        {navItems.map((item, index) => {
                          const sectionId = item.href.substring(1);
                          const isActive = activeSection === sectionId;

                          return (
                            <motion.button
                              key={item.name}
                              onClick={() => scrollToSection(item.href)}
                              className={cn(
                                "nav-item text-left text-lg font-medium py-3 px-4 rounded-xl",
                                isActive 
                                  ? "active text-primary" 
                                  : "text-foreground/80 hover:text-foreground"
                              )}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              aria-label={`Navigate to ${item.name} section`}
                            >
                              {item.name}
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                      
                      <motion.div
                        className="pt-4 border-t border-foreground/10 mt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: navItems.length * 0.1 }}
                      >
                        <Link
                          href="https://blog.shravanrevanna.me/"
                          target="_blank"
                          className="nav-item text-left text-lg font-medium py-3 px-4 rounded-xl flex items-center space-x-2 text-foreground/80 hover:text-foreground"
                          aria-label="Visit blog (opens in new tab)"
                        >
                          <span>Blog</span>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* SVG Filter for Glass Distortion Effect */}
      <svg style={{ display: "none" }}>
        <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.006 0.006" 
            numOctaves="2" 
            seed="92" 
            result="noise" 
          />
          <feGaussianBlur in="noise" stdDeviation="1.5" result="blurred" />
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="blurred" 
            scale="40" 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </svg>
    </>
  );
}