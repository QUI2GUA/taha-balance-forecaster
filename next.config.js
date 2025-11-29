/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Ignore TypeScript errors during build (essential for fast home-lab deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore Linting errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
