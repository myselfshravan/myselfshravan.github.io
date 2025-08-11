'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import portfolioData from '@/lib/portfolio-data.json';
import { trackExternalLink } from '@/lib/click-tracker';

export function Work() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="work"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-muted/10 to-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-mono">
            <span className="text-primary">{'>'}</span> experience
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Building production systems and solving real problems in the industry
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {portfolioData.work.map((job, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="mb-8"
            >
              <Card className="bg-card/50 backdrop-blur-sm border-muted/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {job.company}
                        {job.status === 'Current' && (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            current
                          </Badge>
                        )}
                        {job.website !== '#' && (
                          <button
                            onClick={() => {
                              trackExternalLink(job.website, `Company: ${job.company}`);
                              window.open(job.website, '_blank');
                            }}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                      </CardTitle>
                      <div className="text-primary font-semibold mt-1">{job.position}</div>
                    </div>
                    <div className="flex flex-col sm:items-end text-sm text-muted-foreground font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {job.startDate} - {job.endDate}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.description.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-muted-foreground text-sm leading-relaxed flex items-start gap-2"
                      >
                        <span className="text-primary font-mono text-xs mt-1">{'>'}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
