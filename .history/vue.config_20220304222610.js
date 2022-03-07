module.exports = {
  // Project deployment base
  // By default we assume your app will be deployed at the root of a domain,
  // e.g. https://www.my-app.com/
  // If your app is deployed at a sub-path, you will need to specify that
  // sub-path here. For example, if your app is deployed at
  // https://www.foobar.com/my-app/
  // then change this to '/my-app/'

  // EXAMPLE
  // https://www.example.com/project/v1.1/index.html
  // baseUrl becomes /project/v1.1/

  devServer: {
    host: "localhost",
    port: 8020,
    https: false,
    hotOnly: false,
    open: false,
    // 查阅 https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli/cli-service.md#配置代理
    proxy: {
      "/apiv1": {
        target: "https://open.shuke123.com",
        changeOrigin: true,
        pathRewrite: {
          "^/apiv1": "/",
        },
      },
    },
  },
  // options for 3rd party plugins
  pluginOptions: {
    // ...
  },
};
