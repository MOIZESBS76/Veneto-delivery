/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // REWRITES: Proxy para Backend (Contorna CORS)
  // ============================================================================
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

  // ============================================================================
  // HEADERS: Segurança e Performance
  // ============================================================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // ============================================================================
  // COMPRESSÃO E OTIMIZAÇÃO
  // ============================================================================
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;