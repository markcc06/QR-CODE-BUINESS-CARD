/** @type {import('next').NextConfig} */
const enableServerSharp = process.env.ENABLE_SERVER_SHARP === '1';

module.exports = {
  experimental: {
    // 保持 tesseract.js 在服务端 external，避免被不必要打包干扰
    serverComponentsExternalPackages: [
      'tesseract.js',
      ...(enableServerSharp ? ['sharp'] : []),
    ],

    // 强制把 OCR 路由所需的 Node 版 worker 脚本 和本地 tessdata 打进 serverless 包（避免打进浏览器 worker）
    // 注意：键必须写成路由模块的相对路径（不带 .ts 后缀）
    outputFileTracingIncludes: {
      'app/api/recognize-card/route': [
        './node_modules/tesseract.js/src/worker-script/node/index.js',
        './tessdata/**',
      ],
    },
  },
};