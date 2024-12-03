/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the 'export' output if you want to use custom headers
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  crossOrigin: 'anonymous',
  // Uncomment if you really need these headers
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*',
  //       headers: [
  //         {
  //           key: 'Cross-Origin-Embedder-Policy',
  //           value: 'require-corp',
  //         },
  //         {
  //           key: 'Cross-Origin-Opener-Policy',
  //           value: 'same-origin',
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;