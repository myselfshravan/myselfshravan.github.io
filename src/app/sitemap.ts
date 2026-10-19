import type { MetadataRoute } from 'next';
import portfolioData from '@/lib/portfolio-data.json';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://${portfolioData.meta.domain}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
