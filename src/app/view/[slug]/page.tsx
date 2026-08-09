import fs from 'fs';
import path from 'path';
import { GATED_REPORTS, GATED_REPORT_BY_SLUG } from '@/lib/gated-reports';
import { GatedReport } from '@/components/gated/GatedReport';

/**
 * Prerender one static page per registered report (required for `output: 'export'`).
 */
export function generateStaticParams() {
  return GATED_REPORTS.map((r) => ({ slug: r.slug }));
}

/**
 * Read the report HTML at BUILD time and embed it in the static page payload
 * (this is the "bundle-embedded" mechanism — no public URL exposes the raw
 * HTML; it only ships inside this page's payload). The client gate component
 * decides whether to render it based on the access key.
 */
function loadReportHtml(slug: string): string {
  const file = path.join(process.cwd(), 'src', 'content', 'gated', `${slug}.html`);
  let html = fs.readFileSync(file, 'utf8');

  // klydo_pitch references sibling `screenshots/*.png`; host them under
  // /content/<slug>/ and rewrite the paths to absolute so they resolve inside
  // the iframe srcDoc (which has no base URL).
  if (slug === 'klydo_pitch') {
    html = html.replace(/screenshots\//g, '/content/klydo_pitch/screenshots/');
  }

  return html;
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  // params is async in Next 15, but generateMetadata awaits it.
  return params.then((p) => {
    const report = GATED_REPORT_BY_SLUG[p.slug];
    return {
      title: report ? `${report.title} - Shravan Revanna` : 'Report - Shravan Revanna',
      robots: { index: false, follow: false }, // never index gated content
    };
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = GATED_REPORT_BY_SLUG[slug];
  const html = report ? loadReportHtml(slug) : '';

  return <GatedReport slug={slug} title={report?.title ?? 'Report'} html={html} />;
}
