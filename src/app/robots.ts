import type { MetadataRoute } from 'next';
import portfolioData from '@/lib/portfolio-data.json';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Gated reports are shared by access key and should not be indexed.
      disallow: '/view/',
    },
    sitemap: `https://${portfolioData.meta.domain}/sitemap.xml`,
  };
}
