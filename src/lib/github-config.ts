// GitHub account configurations
export interface GitHubAccount {
  username: string;
  type: string;
  metrics: {
    repositories: string;
    yearsActive: string;
    commits: string;
  }
}

export const githubAccounts: GitHubAccount[] = [
  {
    username: "myselfshravan",
    type: "Primary Account",
    metrics: {
      repositories: "100+",
      yearsActive: "3+",
      commits: "∞"
    }
  },
  {
    username: "githubhosting",
    type: "Secondary Account", 
    metrics: {
      repositories: "50+",
      yearsActive: "2+", 
      commits: "∞"
    }
  }
];

export const statsConfig = {
  theme: "transparent",
  hide_border: "true",
  include_all_commits: "true",
  count_private: "true",
  show_icons: "true",
  ring_color: "00af44",
  title_color: "00af44",
  icon_color: "00af44",
  text_color: "9f9f9f"
} as const;

export const getStatsUrl = (username: string) => {
  const params = Object.entries({
    username,
    rank_icon: "percentile",
    ...statsConfig
  }).reduce((searchParams, [key, value]) => {
    searchParams.append(key, value);
    return searchParams;
  }, new URLSearchParams());
  return `https://github-readme-stats.vercel.app/api?${params.toString()}`;
};
