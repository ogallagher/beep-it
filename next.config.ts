import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BEEPIT_BASEPATH || ''
}

export default nextConfig
