import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
