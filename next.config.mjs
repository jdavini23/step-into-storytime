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
        '*.netlify.app',
      ],
    },
  },
  compiler: {
    emotion: {
      // eslint-disable-next-line no-undef
      sourceMap:
        typeof process !== 'undefined' &&
        process.env.NODE_ENV === 'development',
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
  swcMinify: true,
  // Add middleware configuration
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'query',
              key: 'VAR_ORIGINAL_PATHNAME',
            },
          ],
          destination: '/:path*',
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
  // Environment variables
  env: {
    VAR_ORIGINAL_PATHNAME: '/',
    NEXT_PUBLIC_VAR_ORIGINAL_PATHNAME: '/',
  },
  // Disable service worker in development
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Disable service worker registration in development
      config.devtool = 'source-map';
    }
    return config;
  },
};

// Ensure process is only used in server-side or build-time context
if (typeof window === 'undefined') {
  // eslint-disable-next-line no-undef
  const isDevelopment =
    typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

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

// Set process.env variables for template handling
if (typeof process !== 'undefined') {
  process.env.VAR_ORIGINAL_PATHNAME = '/';
  process.env.NEXT_PUBLIC_VAR_ORIGINAL_PATHNAME = '/';
}

export default nextConfig;
