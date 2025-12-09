const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  optimizeFonts: false,
  images: { unoptimized: true },
  transpilePackages: ['vis-network'],
  webpack: (config, { isServer }) => {
    config.cache = { type: 'memory' }
    return config
  },
};

module.exports = withBundleAnalyzer(nextConfig);