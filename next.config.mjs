/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  output: 'standalone',
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Use a more compatible source map for Electron
      config.devtool = 'source-map';
    }
    return config;
  },
};

export default nextConfig;
