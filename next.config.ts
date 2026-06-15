import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['localhost:3000', '192.168.0.101:3000', '192.168.0.104:3000', '192.168.0.108:3000'],
    },
  },
  // Permite que o celular carregue o Javascript do servidor local
  allowedDevOrigins: ['192.168.0.101', '192.168.0.104', '192.168.0.108'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
