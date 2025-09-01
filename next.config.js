/** @type {import('next').NextConfig} */
const enableServerSharp = process.env.ENABLE_SERVER_SHARP === '1';

const nextConfig = {
  experimental: {
    // 在服务端保持这些包为外部依赖（不要把它们打进函数包），避免打包时破坏二进制
    serverComponentsExternalPackages: [
      'tesseract.js',
      'node-fetch',
      ...(enableServerSharp ? ['sharp', '@img/sharp-linux-x64', '@img/sharp-libvips-linux-x64'] : []),
    ],

    // 让 Next 在为函数做 output tracing 时，把 tesseract（以及可选的 sharp）的资源也带上
    outputFileTracingIncludes: {
      // ⚠️ 路径写成相对项目根目录的形式（不要以 / 开头）
      'app/api/recognize-card/*': [
        // tesseract runtime & language data
        './node_modules/**/tesseract*.*',
        './node_modules/**/worker-script/**/*',
        './node_modules/**/tesseract-core*.wasm',
        './node_modules/**/@tesseract.js-data*/**/*',
        // 按需把 sharp 二进制（cross‑platform 预编译件）打包进函数
        ...(enableServerSharp
          ? [
              './node_modules/sharp/**/*',
              './node_modules/@img/sharp-linux-x64/**/*',
              './node_modules/@img/sharp-libvips-linux-x64/**/*',
            ]
          : []),
      ],
    },
  },
};

module.exports = nextConfig;
