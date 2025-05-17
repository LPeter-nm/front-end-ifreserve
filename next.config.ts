// next.config.mjs (ou .js)
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // ou '4mb' para um valor mais conservador
    },
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*',
      },
    ];
  },
};

export default nextConfig;
