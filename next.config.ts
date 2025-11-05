import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to prevent double renders in development
  
  // Production optimizations
  compress: true,
  
  // Image optimization (handled automatically by Vercel)
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Enable SWC minification (default in Next.js 16)
  swcMinify: true,
};

export default nextConfig;
