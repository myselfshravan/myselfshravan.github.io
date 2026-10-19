'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import portfolioData from '@/lib/portfolio-data.json';

// Old links from the previous portfolio still point at paths like
// `/shravan.github.io/...` and `/index.html`; send those visitors home
// instead of stranding them on a 404.
const LEGACY_PATH = /^\/(shravan\.github\.io(\/|$)|index\.html$)/;

const BLOG_ORIGIN = new URL(portfolioData.writing.blog_url).origin;

// Every blog post slug linked from the portfolio. Search engines and shared
// links sometimes put a post slug on this domain instead of the blog's.
function collectBlogSlugs(value: unknown, slugs: Set<string>): Set<string> {
  if (typeof value === 'string') {
    if (value.startsWith(`${BLOG_ORIGIN}/`)) {
      const slug = new URL(value).pathname.replace(/^\/|\/$/g, '');
      if (slug) slugs.add(slug);
    }
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((child) => collectBlogSlugs(child, slugs));
  }
  return slugs;
}

const BLOG_SLUGS = collectBlogSlugs(portfolioData, new Set());

export default function NotFound() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (LEGACY_PATH.test(pathname)) {
      window.location.replace(`/${search}${hash}`);
      return;
    }
    const slug = pathname.replace(/^\/|\/$/g, '');
    if (BLOG_SLUGS.has(slug)) {
      window.location.replace(`${BLOG_ORIGIN}/${slug}${search}${hash}`);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md text-center font-mono">
        <p className="mb-2 text-sm text-muted-foreground">$ cd {'<path>'}</p>
        <h1 className="mb-6 text-xl font-semibold">404: no such file or directory</h1>
        <Link
          href="/"
          className="text-sm text-primary underline underline-offset-2 hover:opacity-80"
        >
          cd ~
        </Link>
      </div>
    </div>
  );
}
