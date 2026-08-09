'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { checkAccess, type AccessCheckResult } from '@/lib/access-keys';
import { identifyForPostHog } from '@/lib/posthog-identity';

type Status = 'checking' | 'granted' | 'denied';

/**
 * Client-side gate for a single report.
 *
 * Reads `?key=<accessKey>` from the URL (kept in the URL so the shareable link
 * survives reload/forward) and asks Firestore whether that key unlocks this
 * report's slug. On grant, renders the report HTML inside a sandboxed iframe
 * via `srcDoc` (preserves the report's own <head>/styles, no conflict with the
 * Next shell). On deny, shows an access-required screen.
 *
 * PostHog: every visitor is identified (with the key as tracker context when
 * present), and `gated_report_viewed` / `gated_report_denied` events fire. The
 * auto `$pageview` also fires for `/view/<slug>`.
 */
export function GatedReport({ slug, title, html }: { slug: string; title: string; html: string }) {
  const [status, setStatus] = useState<Status>('checking');
  const [result, setResult] = useState<AccessCheckResult | null>(null);
  const [keyInput, setKeyInput] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');

    // Identify in PostHog BEFORE captures. The key doubles as a tracker/source
    // label so views are segmentable by recipient in PostHog.
    identifyForPostHog(key || undefined);

    if (!key) {
      setStatus('denied');
      setResult({ ok: false, reason: 'invalid_format' });
      posthog.capture('gated_report_denied', { slug, reason: 'no_key' });
      return;
    }

    let cancelled = false;
    checkAccess(key, slug).then((res) => {
      if (cancelled) return;
      setResult(res);
      if (res.ok) {
        setStatus('granted');
        posthog.capture('gated_report_viewed', {
          slug,
          key,
          recipient: res.name ?? null,
          referrer: document.referrer || null,
        });
      } else {
        setStatus('denied');
        posthog.capture('gated_report_denied', { slug, key, reason: res.reason ?? 'unknown' });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Verifying access…
        </div>
      </div>
    );
  }

  if (status === 'granted') {
    return (
      <div className="relative h-screen w-full">
        {/* Floating back-to-portfolio link. `?s=report` attributes the return
            click to the "report" source so it shows up in tracking like any
            other share link. Sits above the iframe (iframe sandbox is unaffected
            since this lives in the parent shell). */}
        <Link
          href="/?s=report"
          className="fixed left-3 top-3 z-50 flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
          title="Back to portfolio"
        >
          <span aria-hidden>←</span> Portfolio
        </Link>
        <iframe
          title={title}
          srcDoc={html}
          sandbox="allow-scripts allow-same-origin"
          className="h-screen w-full border-0"
        />
      </div>
    );
  }

  // denied
  const reasonCopy: Record<string, string> = {
    missing: 'This access key was not recognized.',
    wrong_page: 'This key does not unlock this report.',
    invalid_format: 'A valid access key is required.',
    no_key: ' ',
    no_db: 'Could not reach the access service. Try again.',
  };
  const shown = result?.reason ? reasonCopy[result.reason] ?? 'Access denied.' : 'Access denied.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          🔒
        </div>
        <h1 className="mb-2 text-xl font-semibold">{title}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{shown}</p>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const v = keyInput.trim();
            if (!v) return;
            const url = new URL(window.location.href);
            url.searchParams.set('key', v);
            window.location.href = url.toString();
          }}
        >
          <input
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Enter access key"
            autoComplete="off"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Unlock
          </button>
        </form>
        <p className="mt-6 text-xs text-muted-foreground">
          Don&apos;t have a key?{' '}
          <a
            href="mailto:shravanrevanna@gmail.com?subject=Access%20to%20a%20report"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Request access
          </a>
          .
        </p>
        <Link
          href="/?s=report"
          className="mt-4 inline-block text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          ← Back to portfolio
        </Link>
      </div>
    </div>
  );
}
