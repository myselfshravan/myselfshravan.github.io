/**
 * Registry of gated report pages.
 *
 * Each entry = one report accessible at `/view/<slug>?key=<accessKey>`. The slug
 * is also baked into every access key (doc `access_keys/{key}.page`), so a key
 * for one report cannot open another.
 *
 * Adding a report: drop the HTML at `src/content/gated/<slug>.html`, add an
 * entry here, and (if it references local assets) host them under
 * `public/content/<slug>/...` and rewrite the paths in `view/[slug]/page.tsx`.
 * Removing one: delete the HTML + its entry. The admin dashboard picks up the
 * `page` values from this same list at build time of the dashboard.
 */
export interface GatedReport {
  slug: string;
  title: string;
  /** Optional description shown on the access-denied screen. */
  description?: string;
}

export const GATED_REPORTS: GatedReport[] = [
  { slug: 'klydo_pitch', title: 'Klydo — Pitch', description: 'What we built, and how it ended.' },
  { slug: 'acquisition_brief', title: 'Spider — Acquisition & Capability Brief' },
  { slug: 'sherlock_report', title: 'Sherlock — TNPL Agent Performance Report' },
];

export const GATED_SLUGS = GATED_REPORTS.map((r) => r.slug);

export const GATED_REPORT_BY_SLUG: Record<string, GatedReport> = Object.fromEntries(
  GATED_REPORTS.map((r) => [r.slug, r]),
);

export function isGatedSlug(slug: string): boolean {
  return slug in GATED_REPORT_BY_SLUG;
}
