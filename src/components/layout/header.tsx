'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Writing', href: '#writing' },
  { name: 'Projects', href: '#projects' },
  { name: 'GitHub', href: '#github' },
  { name: 'Skills', href: '#skills' },
  { name: 'Work', href: '#work' },
  { name: 'Contact', href: '#contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Active section detection
      const sections = navItems.map((item) => item.href.substring(1));
      const headerHeight = 80; // Fixed header height
      const buffer = 10; // Small buffer for reliable detection
      const scrollPosition = window.scrollY + headerHeight + buffer;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element instanceof HTMLElement) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.querySelector(href);
    if (element && element instanceof HTMLElement) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/40 backdrop-blur-sm border-b border-border/50 shadow-lg shadow-background/10'
          : 'bg-background/5 backdrop-blur-sm'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={() => scrollToSection('#top')}
              className="flex items-center hover:scale-105 transition-all duration-300 cursor-pointer"
              aria-label="Scroll to top"
            >
              <Image
                src="/logo.png"
                alt="Shravan Logo"
                width={100}
                height={30}
                className="dark:invert-0 invert transition-all duration-300"
                priority
              />
            </button>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden md:flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {navItems.map((item, index) => {
                  const sectionId = item.href.substring(1);
                  const isActive = activeSection === sectionId;

                  return (
                    <NavigationMenuItem key={item.name}>
                      <motion.button
                        onClick={() => scrollToSection(item.href)}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'relative group px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-accent/50 focus:bg-accent/50',
                          isActive
                            ? 'text-primary bg-accent/30 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        aria-label={`Navigate to ${item.name} section`}
                      >
                        {item.name}
                        <motion.span
                          className="absolute -bottom-1 left-1/2 h-0.5 bg-primary rounded-full"
                          initial={{ width: 0, x: '-50%' }}
                          animate={{
                            width: isActive ? '80%' : '0%',
                            x: '-50%',
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.button>
                    </NavigationMenuItem>
                  );
                })}
                <NavigationMenuItem>
                  <Link
                    href="https://blog.shravanrevanna.me/"
                    target="_blank"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-300 flex items-center space-x-1 px-4 py-2',
                    )}
                    aria-label="Visit blog (opens in new tab)"
                  >
                    <span>Blog</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </motion.div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-accent/50 transition-colors"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-xl border-l border-border/50"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex items-center justify-end mb-8"></div>
                <nav
                  className="flex flex-col space-y-2"
                  role="navigation"
                  aria-label="Mobile navigation"
                >
                  <AnimatePresence>
                    {navItems.map((item, index) => {
                      const sectionId = item.href.substring(1);
                      const isActive = activeSection === sectionId;

                      return (
                        <motion.button
                          key={item.name}
                          onClick={() => scrollToSection(item.href)}
                          className={cn(
                            'text-left text-lg font-medium transition-all duration-300 py-3 px-4 rounded-lg relative group',
                            isActive
                              ? 'text-primary bg-accent/30 shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent/20',
                          )}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          aria-label={`Navigate to ${item.name} section`}
                        >
                          {item.name}
                          {isActive && (
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"
                              layoutId="activeMobileIndicator"
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                  <motion.div
                    className="pt-4 border-t border-border/50 mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: navItems.length * 0.1 }}
                  >
                    <Link
                      href="https://blog.shravanrevanna.me/"
                      target="_blank"
                      className="text-left text-lg font-medium hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg flex items-center space-x-2 hover:bg-accent/20"
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
    </motion.header>
  );
}
