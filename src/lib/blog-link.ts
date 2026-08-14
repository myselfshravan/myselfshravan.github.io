import portfolioData from './portfolio-data.json';

/**
 * Extracts a stable, URL-safe slug from a blog post's URL: the last path
 * segment of the post URL, lowercased.
 *
 * e.g. ".../6-autonomous-ai-agents-trade-stocks-with-my-money-in-realtime"
 *   -> "6-autonomous-ai-agents-trade-stocks-with-my-money-in-realtime"
 *
 * This is the canonical identifier used to deep-link and highlight a post.
 */
export const getBlogSlug = (postUrl: string): string => {
  let pathname: string;
  try {
    pathname = new URL(postUrl).pathname;
  } catch {
    // Relative/malformed input; fall back to splitting the raw string.
    pathname = postUrl;
  }
  const segments = pathname.split('/').filter(Boolean);
  const slug = segments.pop();
  return slug ? slug.toLowerCase() : '';
};

/**
 * Builds the canonical shareable portfolio link that highlights a given blog
 * post on load: `https://<domain>/?blog=<slug>`.
 *
 * Uses the configured domain (`portfolio-data.json` → `meta.domain`) rather
 * than `window.location.origin` so the link is identical in dev, preview, and
 * production.
 */
export const buildBlogShareUrl = (postUrl: string): string => {
  const domain = portfolioData.meta.domain;
  const slug = getBlogSlug(postUrl);
  return `https://${domain}/?blog=${slug}`;
};

/**
 * Reads the `?blog=` deep-link param from the current URL. Client-only;
 * returns null during SSR.
 */
export const readBlogParam = (): string | null => {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('blog');
};
