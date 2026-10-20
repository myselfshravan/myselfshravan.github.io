'use client';

import { useEffect, useState } from 'react';

const ATLAS_DATA_URL = 'https://atlas.shravanrevanna.me/data/atlas.json';

export interface AtlasStats {
  projects: number;
  loc: number;
  my_commits: number;
  symbols: number;
  endpoints: number;
  first_year: number;
  last_year: number;
}

// One request per page load, shared by every component that asks.
let request: Promise<AtlasStats | null> | null = null;

function fetchAtlasStats(): Promise<AtlasStats | null> {
  request ??= fetch(ATLAS_DATA_URL)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const stats = data?.stats;
      return stats && typeof stats.projects === 'number' ? (stats as AtlasStats) : null;
    })
    .catch(() => null);
  return request;
}

function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace(/0$/, '')}M`;
  if (value >= 10_000) return `${Math.round(value / 1000)}K`;
  return value.toLocaleString('en-US');
}

export function formatAtlasMetrics(stats: AtlasStats): string {
  return [
    `${stats.projects} projects`,
    `${compact(stats.loc)} lines of code`,
    `${stats.my_commits.toLocaleString('en-US')} commits`,
    `${compact(stats.symbols)} symbols`,
    `${stats.endpoints} HTTP endpoints`,
    `${stats.first_year} to ${stats.last_year}`,
  ].join(', ');
}

// Live numbers from the Atlas index. Null until loaded or if Atlas is
// unreachable, so callers keep the build-time copy from portfolio-data.json.
// atlas.json is the whole index (~130 KB compressed), so it is only fetched
// once `enabled` turns true, e.g. when the section showing it is in view.
export function useAtlasStats(enabled = true): AtlasStats | null {
  const [stats, setStats] = useState<AtlasStats | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchAtlasStats().then((result) => {
      if (!cancelled) setStats(result);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return stats;
}
