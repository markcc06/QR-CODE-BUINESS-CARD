/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 在服务端保持这些包为外部依赖（不要把它们打进函数包），避免打包时破坏二进制
    serverComponentsExternalPackages: [
      'tesseract.js',
      'sharp',
      'node-fetch',
      '@img/sharp-linux-x64',
      '@img/sharp-libvips-linux-x64',
    ],

    // 让 Next 在为函数做 output tracing 时，把 tesseract 和 sharp 的二进制/资源也一起带上
    outputFileTracingIncludes: {
      // ⚠️ 路径写成相对项目根目录的形式（不要以 / 开头）
      'app/api/recognize-card/*': [
        // tesseract runtime & language data
        './node_modules/**/tesseract*.*',
        './node_modules/**/worker-script/**/*',
        './node_modules/**/tesseract-core*.wasm',
        './node_modules/**/@tesseract.js-data*/**/*',

        // sharp 二进制（cross‑platform 预编译件）
        './node_modules/sharp/**/*',
        './node_modules/@img/sharp-linux-x64/**/*',
        './node_modules/@img/sharp-libvips-linux-x64/**/*',
      ],
    },
  },
};

module.exports = nextConfig;
