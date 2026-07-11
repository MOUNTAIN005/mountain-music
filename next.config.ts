import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Railway 部署不需要 standalone 输出（Nixpacks 自动处理）
  // NAS/Docker 部署仍然使用 standalone
  output: process.env.RAILWAY ? undefined : 'standalone',
  images: {
    remotePatterns: [],
    domains: ['localhost'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
}

export default nextConfig
