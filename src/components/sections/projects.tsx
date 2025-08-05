"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, FileText, Play } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import portfolioData from "@/lib/portfolio-data.json";
import Image from "next/image";

interface Project {
  name: string;
  image?: string;
  website_url?: string;
  github_url?: string;
  blog_url?: string;
  demo_url?: string;
  url?: string;
  linkText?: string;
  description?: string;
  tech?: string;
  metrics?: string;
}

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Flatten all projects into a single array
  const allProjects = [
    ...portfolioData.projects.personal,
    ...portfolioData.projects.automation,
    ...portfolioData.projects.tools,
  ];

  const ProjectCard = ({
    project,
    index,
  }: {
    project: Project;
    index: number;
  }) => {
    // Get all available URLs
    const urls = [
      {
        type: "website",
        url: project.website_url,
        icon: ExternalLink,
        label: "Live Site",
      },
      {
        type: "github",
        url: project.github_url,
        icon: GitHubLogoIcon,
        label: "GitHub",
      },
      { type: "blog", url: project.blog_url, icon: FileText, label: "Blog" },
      { type: "demo", url: project.demo_url, icon: Play, label: "Demo" },
      { type: "url", url: project.url, icon: ExternalLink, label: "View" }, // fallback for old structure
    ].filter((link) => link.url);

    return (
      <motion.div
        className="project-card group"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -4, scale: 1.01 }}
      >
        <Card className="h-full overflow-hidden bg-card/70 backdrop-blur-sm border border-primary/10 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:border-primary/30 shadow-lg hover:bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold font-mono">
              <span className="text-primary mr-2">{">"}</span>
              {project.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {project.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {project.description}
              </p>
            )}

            {project.tech && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  Tech Stack
                </div>
                <div className="text-xs text-primary font-mono bg-primary/5 px-2 py-1 rounded border border-primary/20">
                  {project.tech}
                </div>
              </div>
            )}

            {project.metrics && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  Impact
                </div>
                <div className="text-xs text-green-400 font-mono bg-green-400/5 px-2 py-1 rounded border border-green-400/20">
                  {project.metrics}
                </div>
              </div>
            )}

            {/* Multiple URL Buttons */}
            {urls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {urls.map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(link.url, "_blank")}
                      className="font-mono text-xs border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
                    >
                      <Icon className="mr-1 h-3 w-3" />
                      {link.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-mono">
            <span className="text-primary">$</span> ls projects/
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Production applications, automation scripts, and tools that solve
            real problems
          </p>
        </motion.div>

        {/* All Projects Grid */}
        <motion.div
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {allProjects.map((project, index) => (
            <ProjectCard
              key={`project-${index}`}
              project={project}
              index={index}
            />
          ))}
        </motion.div>

        {/* GitHub Stats Section */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 font-mono">
              <span className="text-primary">{">"}</span> github stats
            </h3>
            <p className="text-muted-foreground">
              My coding journey visualized through GitHub statistics
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main Account Stats */}
            <Card className="p-4 bg-gradient-to-br from-card/50 to-muted/20 backdrop-blur-sm border-muted/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 font-mono text-sm">
                  <GitHubLogoIcon className="h-5 w-5" />
                  <span>Primary Account</span>
                  <button
                    className="text-primary hover:text-primary/80 transition-colors font-mono text-xs underline underline-offset-2"
                    onClick={() =>
                      window.open(
                        "https://github.com/myselfshravan?tab=repositories",
                        "_blank"
                      )
                    }
                  >
                    @myselfshravan
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-2">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary font-mono">
                      100+
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      repositories
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary font-mono">
                      3+
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      years_active
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary font-mono">
                      ∞
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      commits
                    </div>
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
                <CardTitle className="flex items-center space-x-2 font-mono text-sm">
                  <GitHubLogoIcon className="h-5 w-5" />
                  <span>Secondary Account</span>
                  <button
                    className="text-primary hover:text-primary/80 transition-colors font-mono text-xs underline underline-offset-2"
                    onClick={() =>
                      window.open(
                        "https://github.com/githubhosting?tab=repositories",
                        "_blank"
                      )
                    }
                  >
                    @githubhosting
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-2">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary font-mono">
                      50+
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      repositories
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary font-mono">
                      2+
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      years_active
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary font-mono">
                      ∞
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      commits
                    </div>
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
