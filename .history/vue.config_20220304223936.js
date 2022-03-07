const path = require("path");
const resolve = (dir) => path.join(__dirname, dir);
module.exports = {

  devServer: {
    host: "localhost",
    port: 8020,
    https: false,
    hotOnly: false,
    open: false,
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
  chainWebpack: (config) => {
    //配置别名
    config.resolve.alias
      .set("@", resolve("src"))
      .set("assets", resolve("src/assets"))
      .set("comp", resolve("src/components"))
      .set("utils", resolve("src/utils"))
      .set("api", resolve("src/api"))
      
  },
};
