"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Github,
  Star,
  Users,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import portfolioData from "@/lib/portfolio-data.json";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (typeof window !== "undefined" && projectsRef.current) {
      const projectCards =
        projectsRef.current.querySelectorAll(".project-card");

      gsap.fromTo(
        projectCards,
        { y: 100, opacity: 0, rotationX: 15 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: projectsRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, [activeTab]);

  const projectTabs = [
    {
      id: "personal",
      label: "Personal Projects",
      icon: Star,
      projects: portfolioData.projects.personal,
      description: "Projects I've built independently",
    },
    {
      id: "team",
      label: "Team Projects",
      icon: Users,
      projects: portfolioData.projects.team,
      description: "Collaborative projects with teams",
    },
    {
      id: "pending",
      label: "In Progress",
      icon: Clock,
      projects: portfolioData.projects.pending,
      description: "Projects currently in development",
    },
  ];

  const ProjectCard = ({
    project,
    index,
  }: {
    project: {
      name: string;
      image: string;
      url: string;
      linkText: string;
      description?: string;
    };
    index: number;
  }) => (
    <motion.div
      className="project-card group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Card className="h-full overflow-hidden bg-card/50 backdrop-blur-sm border-muted/20 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 group-hover:border-primary/30">
        <div className="relative overflow-hidden">
          <div className="aspect-video relative bg-gradient-to-br from-primary/5 to-secondary/5">
            <Image
              src={`/assets/img/${project.image}`}
              alt={project.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Floating Action Button */}
          <motion.div
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
            initial={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg"
              onClick={() => window.open(project.url, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {project.name}
            </span>
            <Badge variant="outline" className="ml-2 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          {project.description && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {project.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(project.url, "_blank")}
              className="group-hover:bg-primary/10 transition-colors"
            >
              {project.linkText}
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <section
      id="projects"
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
            My{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Work
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A showcase of projects that demonstrate my skills and passion for
            creating innovative solutions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-12 bg-muted/50 backdrop-blur-sm">
              {projectTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {projectTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-8">
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-muted-foreground">{tab.description}</p>
                </motion.div>

                <div
                  ref={projectsRef}
                  className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
                >
                  <AnimatePresence mode="wait">
                    {tab.projects.map((project, index) => (
                      <ProjectCard
                        key={`${tab.id}-${index}`}
                        project={project}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* GitHub Stats Section */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              GitHub{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Analytics
              </span>
            </h3>
            <p className="text-muted-foreground">
              My coding journey visualized through GitHub statistics
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main Account Stats */}
            <Card className="p-4 bg-gradient-to-br from-card/50 to-muted/20 backdrop-blur-sm border-muted/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Github className="h-5 w-5" />
                  <span>Primary Account</span>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() =>
                      window.open(
                        "https://github.com/myselfshravan?tab=repositories",
                        "_blank"
                      )
                    }
                  >
                    @myselfshravan
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-2">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">100+</div>
                    <div className="text-xs text-muted-foreground">
                      Repositories
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">3+</div>
                    <div className="text-xs text-muted-foreground">
                      Years Active
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">∞</div>
                    <div className="text-xs text-muted-foreground">Commits</div>
                  </div>
                </div>
                <div className="aspect-video relative bg-muted/20 rounded-lg overflow-hidden">
                  <Image
                    src="https://github-readme-stats.vercel.app/api?username=myselfshravan&theme=transparent&hide_border=true&include_all_commits=false&count_private=false"
                    alt="GitHub Stats"
                    fill
                    className="object-contain"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Second Account Stats */}
            <Card className="p-4 bg-gradient-to-br from-card/50 to-muted/20 backdrop-blur-sm border-muted/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Github className="h-5 w-5" />
                  <span>Secondary Account</span>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() =>
                      window.open(
                        "https://github.com/githubhosting?tab=repositories",
                        "_blank"
                      )
                    }
                  >
                    @githubhosting
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-2">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-xs text-muted-foreground">
                      Repositories
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">2+</div>
                    <div className="text-xs text-muted-foreground">
                      Years Active
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">∞</div>
                    <div className="text-xs text-muted-foreground">Commits</div>
                  </div>
                </div>
                <div className="aspect-video relative bg-muted/20 rounded-lg overflow-hidden">
                  <Image
                    src="https://github-readme-stats.vercel.app/api?username=githubhosting&theme=transparent&hide_border=true&include_all_commits=false&count_private=false"
                    alt="GitHub Stats Secondary"
                    fill
                    className="object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
