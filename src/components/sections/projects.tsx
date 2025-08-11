'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ExternalLink, FileText, Play } from 'lucide-react';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import portfolioData from '@/lib/portfolio-data.json';

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
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Flatten all projects into a single array
  const allProjects = [
    ...portfolioData.projects.personal,
    ...portfolioData.projects.automation,
    ...portfolioData.projects.tools,
  ];

  const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
    // Get all available URLs
    const urls = [
      {
        type: 'website',
        url: project.website_url,
        icon: ExternalLink,
        label: 'Live Site',
      },
      {
        type: 'github',
        url: project.github_url,
        icon: GitHubLogoIcon,
        label: 'GitHub',
      },
      { type: 'blog', url: project.blog_url, icon: FileText, label: 'Blog' },
      { type: 'demo', url: project.demo_url, icon: Play, label: 'Demo' },
      { type: 'url', url: project.url, icon: ExternalLink, label: 'View' }, // fallback for old structure
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
              <span className="text-primary mr-2">{'>'}</span>
              {project.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {project.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">{project.description}</p>
            )}

            {project.tech && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-muted-foreground tracking-tight">
                  Built With →
                </div>
                <div className="text-xs text-primary font-mono bg-primary/5 px-2 py-1 rounded border border-primary/20">
                  {project.tech}
                </div>
              </div>
            )}

            {project.metrics && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-muted-foreground tracking-tight">
                  stdout →
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
                      onClick={() => window.open(link.url, '_blank')}
                      className="font-mono text-xs border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
                      trackingCategory="project"
                      trackingId={project.name}
                      trackingAction={`click_${link.type}`}
                      trackingContext={{
                        section: 'projects',
                        position: index,
                        url: link.url,
                        metadata: { linkType: link.type, linkLabel: link.label }
                      }}
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
            Production applications, automation scripts, and tools that solve real problems
          </p>
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            built. deployed. maintained.
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
            <ProjectCard key={`project-${index}`} project={project} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
