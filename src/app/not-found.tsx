'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Old links from the previous portfolio still point at paths like
// `/shravan.github.io/...` and `/index.html`; send those visitors home
// instead of stranding them on a 404.
const LEGACY_PATH = /^\/(shravan\.github\.io(\/|$)|index\.html$)/;

export default function NotFound() {
  useEffect(() => {
    if (LEGACY_PATH.test(window.location.pathname)) {
      window.location.replace(`/${window.location.search}${window.location.hash}`);
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
