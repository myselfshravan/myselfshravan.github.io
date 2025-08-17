'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { GitHubAccount, fetchGitHubStats, formatNumber } from '@/lib/github-config';

interface GitHubStatsCardProps {
  account: GitHubAccount;
  statsUrl: string;
}

export function GitHubStatsCard({ account, statsUrl }: GitHubStatsCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState(account.metrics);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      const stats = await fetchGitHubStats(account.username);
      if (stats) {
        setMetrics((prev) => ({
          ...prev, // use previous state, not account.metrics
          repositories: formatNumber(stats.total_repos),
          ownedRepos: formatNumber(stats.repos_count.owned),
          commits: formatNumber(stats.commits),
        }));
      }
      setIsLoading(false);
    };

    loadStats();
  }, [account.username]);

  return (
    <Card className="px-2 pt-10 bg-gradient-to-br from-card/50 to-muted/20 backdrop-blur-sm border border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-1 font-mono text-sm">
          <GitHubLogoIcon className="h-5 w-5" />
          <span>{account.type}</span>
          <button
            className="text-primary hover:text-primary/80 transition-colors font-mono text-sm underline underline-offset-4"
            onClick={() =>
              window.open(`https://github.com/${account.username}?tab=repositories`, '_blank')
            }
          >
            @{account.username}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-2">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary font-mono">
              {isLoading ? <span className="animate-pulse">...</span> : metrics.repositories}
            </div>
            <div className="text-xs text-muted-foreground font-mono">repositories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary font-mono">
              {isLoading ? <span className="animate-pulse">...</span> : metrics.ownedRepos}
            </div>
            <div className="text-xs text-muted-foreground font-mono">owned_repos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary font-mono">
              {isLoading ? <span className="animate-pulse">...</span> : metrics.commits}
            </div>
            <div className="text-xs text-muted-foreground font-mono">commits</div>
          </div>
        </div>
        <div className="aspect-video relative bg-muted/20 rounded-lg overflow-hidden">
          <Image
            src={statsUrl}
            alt={`GitHub Stats for ${account.username}`}
            fill
            className="object-contain"
          />
        </div>
        <div className="text-xs text-muted-foreground font-mono text-center">
          <div className="inline-flex items-center gap-2 justify-center align-middle">
            {/* Dot with ping effect */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 animate-pulse"></span>
            </span>
            {/* Text inline with dot */}
            <span>
              Real-time stats pulled via my own
              <a
                href="https://github.com/myselfshravan/git-stats-api"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:text-primary/80 transition-colors"
              >
                [API]
              </a>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
