const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  outputDir: 'dist', // 运行时生成的生产环境构建文件的目录(默认''dist''，构建之前会被清除)
  assetsDir: '', // 放置生成的静态资源(s、css、img、fonts)的(相对于 outputDir 的)目录(默认'')
  indexPath: 'index.html', // 指定生成的 index.html 的输出路径(相对于 outputDir)也可以是一个绝对路径。
  lintOnSave: true, // 是否在保存的时候检查
  productionSourceMap: false, // 生产环境是否生成 sourceMap 文件
  publicPath: '/',
  transpileDependencies: true,
  chainWebpack: config => {
    config.module
      .rule('worker')
      .test(/\.worker\.js/)
      .use('worker')
      .loader('worker-loader')
      .options({
        inline: 'fallback',
      })
  },
  devServer: {
    https: true,
    port: '4481', //或7481
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  }
})
