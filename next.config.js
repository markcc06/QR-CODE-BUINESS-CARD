/** @type {import('next').NextConfig} */
const enableServerSharp = process.env.ENABLE_SERVER_SHARP === '1';

module.exports = {
  experimental: {
    // 保持 tesseract.js 在服务端 external，避免 bundler 干扰 wasm 路径
    serverComponentsExternalPackages: [
      'tesseract.js',
      ...(enableServerSharp ? ['sharp'] : []),
    ],

    // 强制把 OCR 路由所需的通用 worker + Node 版 worker 以及本地 tessdata 打进 serverless 包
    // 注意：键必须是不带 .ts 后缀的路由模块相对路径
    outputFileTracingIncludes: {
      'app/api/recognize-card/route': [
        './node_modules/tesseract.js/dist/worker.min.js',
        './node_modules/tesseract.js/src/worker-script/node/index.js',
        './tessdata/**',
      ],
    },
  },
};