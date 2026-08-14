'use client';

import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ExternalLink, FileText, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import portfolioData from '@/lib/portfolio-data.json';
import { trackExternalLink } from '@/lib/click-tracker';
import { buildBlogShareUrl, getBlogSlug } from '@/lib/blog-link';
import { useBlogHighlight } from '@/hooks/use-blog-highlight';
import { cn } from '@/lib/utils';
import posthog from 'posthog-js';
import { useSectionTracker } from '@/hooks/use-section-tracker';

type FeaturedPost = (typeof portfolioData.writing.featured_posts)[number];

export function Writing() {
  const sectionRef = useSectionTracker('writing');
  const { highlightedSlug, registerCard } = useBlogHighlight();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const handleShare = useCallback(async (post: FeaturedPost) => {
    const slug = getBlogSlug(post.url);
    const url = buildBlogShareUrl(post.url);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      posthog.capture('blog_share_link_copied', { slug, title: post.title });
      window.setTimeout(() => {
        setCopiedSlug((prev) => (prev === slug ? null : prev));
      }, 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context); fall back to a prompt.
      window.prompt('Copy this link to share:', url);
    }
  }, []);

  return (
    <section id="writing" ref={sectionRef} className="py-20 bg-muted/20">
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
            I write code. Sometimes I write about it too - automation, AI projects, and the tools I
            build. Real stories from the trenches.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {portfolioData.writing.featured_posts.map((post, index) => {
            const slug = getBlogSlug(post.url);
            const isHighlighted = highlightedSlug === slug;
            const isCopied = copiedSlug === slug;

            return (
              <motion.div
                key={slug || index}
                ref={registerCard(slug)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={cn(
                    'relative h-full hover:shadow-lg transition-all duration-300 border bg-background/60 backdrop-blur-sm',
                    isHighlighted
                      ? 'border-primary ring-2 ring-primary bg-primary/5 shadow-[0_0_30px_-5px_var(--primary)]'
                      : 'border-muted/40',
                  )}
                >
                  {isHighlighted && (
                    <motion.span
                      initial={false}
                      animate={reducedMotion ? undefined : { scale: [1, 1.12, 1] }}
                      transition={{ duration: 1.2, repeat: 3, ease: 'easeInOut' }}
                      className="absolute -top-3 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground shadow-md"
                    >
                      <Sparkles className="h-3 w-3" />
                      Featured post
                    </motion.span>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div className="relative flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(post)}
                          className="p-1 h-auto"
                          aria-label={`Share link to ${post.title}`}
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            trackExternalLink(post.url, `Blog Post: ${post.title}`);
                            posthog.capture('blog_post_clicked', {
                              post_title: post.title,
                              post_url: post.url,
                            });
                            window.open(post.url, '_blank');
                          }}
                          className="p-1 h-auto"
                          aria-label="Read article (opens in new tab)"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <AnimatePresence>
                          {isCopied && (
                            <motion.span
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute -bottom-6 right-0 text-xs font-medium text-primary whitespace-nowrap pointer-events-none"
                            >
                              Copied!
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
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
                      onClick={() => {
                        trackExternalLink(post.url, `Blog Post: ${post.title}`);
                        window.open(post.url, '_blank');
                      }}
                      className="w-full text-sm border-primary/20 hover:bg-primary/5"
                    >
                      read article
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
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
            onClick={() => {
              trackExternalLink(portfolioData.writing.blog_url, 'Blog: All Posts');
              posthog.capture('view_all_posts_clicked');
              window.open(portfolioData.writing.blog_url, '_blank');
            }}
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
