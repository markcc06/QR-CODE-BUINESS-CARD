/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 这些包不要被打到 bundle 里，保持原样随函数一起部署
    serverComponentsExternalPackages: ['tesseract.js', 'sharp', 'node-fetch'],

    // 把 worker/wasm/以及 sharp 的原生二进制都打进 /api/recognize-card 函数
    outputFileTracingIncludes: {
      '/app/api/recognize-card/*': [
        './node_modules/sharp/**/*',
        './node_modules/tesseract.js/**/*',
        './node_modules/worker-script/**/*',
        './node_modules/tesseract-core.wasm',          // 保险起见
        './node_modules/tesseract.js-core/**/*',
        './node_modules/@tesseract.js-data/**/**/*',
      ],
    },
  },
};

module.exports = nextConfig;
