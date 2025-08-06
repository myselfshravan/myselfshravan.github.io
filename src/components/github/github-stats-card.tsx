"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { GitHubAccount } from "@/lib/github-config";

interface GitHubStatsCardProps {
  account: GitHubAccount;
  statsUrl: string;
}

export function GitHubStatsCard({ account, statsUrl }: GitHubStatsCardProps) {
  return (
    <Card className="p-4 bg-gradient-to-br from-card/50 to-muted/20 backdrop-blur-sm border border-primary/10 hover:border-primary/30 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 font-mono text-sm">
          <GitHubLogoIcon className="h-5 w-5" />
          <span>{account.type}</span>
          <button
            className="text-primary hover:text-primary/80 transition-colors font-mono text-xs underline underline-offset-2"
            onClick={() =>
              window.open(
                `https://github.com/${account.username}?tab=repositories`,
                "_blank"
              )
            }
          >
            @{account.username}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-2">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary font-mono">
              {account.metrics.repositories}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              repositories
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary font-mono">
              {account.metrics.yearsActive}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              years_active
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary font-mono">
              {account.metrics.commits}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              commits
            </div>
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
      </CardContent>
    </Card>
  );
}
