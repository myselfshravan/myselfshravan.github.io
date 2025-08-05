"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Hero } from "@/components/sections/hero";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Writing } from "@/components/sections/writing";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/layout/footer";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  useEffect(() => {
    // Initialize smooth scrolling and scroll-triggered animations
    if (typeof window !== "undefined") {
      // Set up scroll-triggered animations (exclude hero section)
      const sections = document.querySelectorAll("section:not(.hero-section)");

      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0.8 },
          {
            opacity: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Parallax effect for hero background elements
      gsap.to(".hero-bg-1", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-bg-1",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-bg-2", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-bg-2",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // Refresh ScrollTrigger on window resize
      const handleResize = () => {
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Hero />
        <Projects />
        <Writing />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
