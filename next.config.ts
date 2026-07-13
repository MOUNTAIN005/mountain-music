import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [],
    domains: ['localhost'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    outputFileTracingIncludes: {
      '/**/*': ['./prisma/**/*'],
    },
  },
}

export default nextConfig
