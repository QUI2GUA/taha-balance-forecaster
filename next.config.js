/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Dangerously allow production builds to successfully complete even if
  // your project has type errors.
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Dangerously allow production builds to successfully complete even if
  // your project has ESLint errors.
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
