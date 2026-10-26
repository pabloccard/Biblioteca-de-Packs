import type { NextConfig } from "next";

// Prevent ArrayBuffer transfer detach errors in Node 24+ during response streaming
if (typeof Buffer !== 'undefined') {
  Buffer.poolSize = 0;
}

// Allow local network IPs for mobile testing
const localIps = Array.from({ length: 50 }, (_, i) => `192.168.0.${100 + i}`);
const allowedOrigins = [
  'localhost:3000',
  ...localIps.map((ip) => `${ip}:3000`),
];
const allowedDevOrigins = [
  'localhost',
  ...localIps,
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins,
    },
  },
  // Permite que o celular carregue o Javascript do servidor local
  allowedDevOrigins,
  images: {
    unoptimized: true,
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
  async headers() {
    return [
      {
        source: '/:path*\\.(ico|png|svg|jpg|jpeg|gif|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
