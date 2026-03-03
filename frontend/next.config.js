/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Image optimization enabled (default Next.js behavior)
  // Allows Next.js to optimize images on-the-fly (resize, WebP conversion, lazy loading)
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  // Enable compression for all responses
  compress: true,
  // Production source maps disabled for smaller bundle
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
