/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:8888',
        'localhost',
        '*.netlify.app',
      ],
    },
  },
  compiler: {
    emotion: {
      sourceMap: process.env.NODE_ENV === 'development',
      autoLabel: 'dev-only',
      labelFormat: '[local]',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
    return [];
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
  // Service worker configuration
  webpack: (config, { dev, isServer }) => {
    if (!isServer && !dev) {
      config.devtool = 'source-map';
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/cnm-sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
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
