/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Add this for Next.js 15 compatibility
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: [],
    appDir: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['@heroicons/react']
  },
  
  // This can help with the VAR_ORIGINAL_PATHNAME issue
  pageExtensions: ['js', 'jsx', 'ts', 'tsx']
}

module.exports = nextConfig
