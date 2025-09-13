import { withNx } from '@nx/next/plugins/with-nx.js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000/api/:path*'
          : 'https://waste-api-git-main-shls-projects-a6bf1b30.vercel.app/api/:path*',
      },
    ]
  },
}

export default withNx(nextConfig)
