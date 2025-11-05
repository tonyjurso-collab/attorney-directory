import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to prevent double renders in development
  
  // Production optimizations
  compress: true,
  
  // Image optimization (handled automatically by Vercel)
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // SWC minification is enabled by default in Next.js 16, no need to specify
};

export default nextConfig;
