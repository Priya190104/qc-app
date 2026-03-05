/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // ESLint warnings/errors will not fail the production build
    ignoreDuringBuilds: true,
  },
  // Image optimization enabled (default Next.js behavior)
  // Allows Next.js to optimize images on-the-fly (resize, WebP conversion, lazy loading)
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'https://aplikasi-monitoring-bpnspcilacap.com/api',
  },
  // Allow cross-origin requests from production domain
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
  // Enable compression for all responses
  compress: true,
  // Production source maps disabled for smaller bundle
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
