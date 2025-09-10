/** @type {import('next').NextConfig} */
const enableServerSharp = process.env.ENABLE_SERVER_SHARP === '1';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep tesseract.js external on the server to avoid wasm path bundling issues
    serverComponentsExternalPackages: [
      'tesseract.js',
      ...(enableServerSharp ? ['sharp'] : []),
    ],

    outputFileTracingIncludes: {
      'app/api/recognize-card/route': [
        './node_modules/tesseract.js/dist/worker.min.js',
        './node_modules/tesseract.js/src/worker-script/node/index.js',
        './tessdata/**',
      ],
    },
  },

  webpack: (config, { dev }) => {
    // Use in-memory cache during development to avoid disk pack.gz rename/ENOENT issues
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

module.exports = nextConfig;