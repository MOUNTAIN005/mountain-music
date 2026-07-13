import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  outputFileTracingIncludes: {
    '/**/*': ['./prisma/**/*'],
  },
}

export default nextConfig
