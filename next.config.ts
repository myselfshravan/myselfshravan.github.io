import type { NextConfig } from 'next';

// Formatted once at build time so the static HTML and the hydrated client
// render the same "Last Updated" string (a render-time `new Date()` caused
// React hydration error #418 for every visitor on a later day than the build).
const BUILD_DATE = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Kolkata',
});

const nextConfig: NextConfig = {
  output: 'export',
  env: {
    NEXT_PUBLIC_BUILD_DATE: BUILD_DATE,
  },
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  basePath: '',
  assetPrefix: '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
