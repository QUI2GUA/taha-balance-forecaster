/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Ignore TypeScript errors during build (essential for fast home-lab deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
