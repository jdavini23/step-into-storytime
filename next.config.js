/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
  webpack: (config) => {
    // config.module.rules.push({
    //   test: /\.svg$/,
    //   use: ['@svgr/webpack'],
    // });
    return config;
  },
};

module.exports = nextConfig;
