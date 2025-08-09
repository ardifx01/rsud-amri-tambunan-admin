/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/offline',
        destination: '/offline',
      },
    ];
  },
  // Atau jika ingin redirect ke halaman offline saat error
  async redirects() {
    return [
      // Tambahkan redirect rules jika diperlukan
    ];
  },
};

module.exports = nextConfig;