/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Next.js 14.1.0 compatible experimental options
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: [],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['@heroicons/react']
  },
  
  // This can help with routing issues
  pageExtensions: ['js', 'jsx', 'ts', 'tsx']
}

// Change from CommonJS to ESM syntax
export default nextConfig
