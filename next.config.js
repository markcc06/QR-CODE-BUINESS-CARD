/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 让 Next 在服务端按“外部包”处理 tesseract.js，避免把 worker 打包坏
    serverComponentsExternalPackages: ['tesseract.js', 'node-fetch'],

    // 把 worker/wasm/语言数据追踪进产物（路由目录按你的项目来）
    outputFileTracingIncludes: {
      // App Router 的 API 目录
      '/app/api/recognize-card/*': [
        './node_modules/**/tesseract*.*',
        './node_modules/**/worker-script/**/*',
        './node_modules/**/tesseract-core*.wasm',
        './node_modules/**/@tesseract.js-data*/**/*',
      ]
    },
  },
  // 如果你有使用 transpilePackages 也可以加上（多数情况不是必须）
  // transpilePackages: ['tesseract.js'],
};

module.exports = nextConfig;
