// API Response Types
export interface ApiResponse {
  commits: number;
  total_repos: number;
  repos_count: ReposCount;
}

export interface ReposCount {
  owned: number;
  original: number;
  private: number;
}

// GitHub account configurations
export interface GitHubAccount {
  username: string;
  type: string;
  metrics: {
    repositories: number | string;
    ownedRepos: number | string;
    commits: number | string;
  };
}

// Fetch GitHub Stats
export async function fetchGitHubStats(username: string): Promise<ApiResponse | null> {
  try {
    const response = await fetch(`https://gitstatsapi.vercel.app/api/commits/${username}`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return null;
  }
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `${num}`;
}

export const githubAccounts: GitHubAccount[] = [
  {
    username: 'myselfshravan',
    type: 'Primary Account',
    metrics: {
      repositories: 0, // Will be updated dynamically
      ownedRepos: 0, // Will be updated dynamically
      commits: 0, // Will be updated dynamically
    },
  },
  {
    username: 'githubhosting',
    type: 'Secondary Account',
    metrics: {
      repositories: 0, // Will be updated dynamically
      ownedRepos: 0, // Will be updated dynamically
      commits: 0, // Will be updated dynamically
    },
  },
];

export const statsConfig = {
  theme: 'transparent',
  hide_border: 'true',
  include_all_commits: 'true',
  count_private: 'true',
  show_icons: 'true',
  ring_color: '00af44',
  title_color: '00af44',
  icon_color: '00af44',
  text_color: '9f9f9f',
  hide: 'commits',
} as const;

export const getStatsUrl = (username: string) => {
  const params = Object.entries({
    username,
    rank_icon: 'percentile',
    ...statsConfig,
  }).reduce((searchParams, [key, value]) => {
    searchParams.append(key, value);
    return searchParams;
  }, new URLSearchParams());
  return `https://github-stats-eight-psi.vercel.app/api?${params.toString()}`;
};
