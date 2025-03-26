/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001',
        'localhost:3002',
        'localhost:3003',
      ],
    },
    fallbackNodePolyfills: false, // Ensure unnecessary polyfills are off
  },
  compiler: {
    emotion: {
      // eslint-disable-next-line no-undef
      sourceMap: typeof process !== 'undefined' && process.env.NODE_ENV === 'development',
      autoLabel: 'dev-only',
      labelFormat: '[local]',
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  sassOptions: {
    includePaths: ['./styles'],
  },
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  // Add middleware configuration
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ],
    };
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_VAR_ORIGINAL_PATHNAME: '/',
    VAR_ORIGINAL_PATHNAME: '/', // Add the missing variable
  },
};

// Ensure process is only used in server-side or build-time context
if (typeof window === 'undefined') {
  // eslint-disable-next-line no-undef
  const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  nextConfig.compiler = {
    emotion: {
      sourceMap: isDevelopment,
      autoLabel: 'dev-only',
      labelFormat: '[local]',
    },
  };
} else {
  nextConfig.compiler = {
    emotion: {
      sourceMap: false,
      autoLabel: 'dev-only',
      labelFormat: '[local]',
    },
  };
}

export default nextConfig;
