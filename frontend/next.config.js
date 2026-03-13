/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'https://veneto-delivery-backend.railway.app/api/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;