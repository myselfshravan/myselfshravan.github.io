"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import portfolioData from "@/lib/portfolio-data.json";

export function Writing() {
  return (
    <section id="writing" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-mono">
            <span className="text-primary">#</span> writings.md
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            I write code. Sometimes I write about it too - automation, AI
            projects, and the tools I build. Real stories from the trenches.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {portfolioData.writing.featured_posts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border border-muted/40 bg-background/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(post.url, "_blank")}
                      className="p-1 h-auto"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg font-semibold leading-tight">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => window.open(post.url, "_blank")}
                    className="w-full text-sm border-primary/20 hover:bg-primary/5"
                  >
                    read article
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            onClick={() =>
              window.open(portfolioData.writing.blog_url, "_blank")
            }
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
          >
            <FileText className="mr-2 h-4 w-4" />
            view all posts
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
