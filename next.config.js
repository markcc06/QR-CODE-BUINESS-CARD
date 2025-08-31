/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 让 Next 在服务端“外部包”处理，避免把原生 addon 打坏
    serverComponentsExternalPackages: ['tesseract.js', 'sharp', 'node-fetch'],

    // 把 worker/wasm/语言数据 & sharp 的二进制文件追踪进产物
    outputFileTracingIncludes: {
      // 你的 API 路由目录（保持与你项目一致）
      '/app/api/recognize-card/*': [
        './node_modules/**/tesseract*.**',
        './node_modules/**/worker-script/**',
        './node_modules/**/tesseract-core.wasm',
        './node_modules/**/@tesseract.js-data/**',
        // 关键：把 sharp 的原生二进制也带上
        './node_modules/sharp/**/*'
      ],
    },
  },
};

module.exports = nextConfig;
