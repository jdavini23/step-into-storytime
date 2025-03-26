/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Add this for Next.js 15 compatibility
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: [],
    appDir: true
  }
}

module.exports = nextConfig
