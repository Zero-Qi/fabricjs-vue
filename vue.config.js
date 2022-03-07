const path = require("path");
const resolve = (dir) => path.join(__dirname, dir);
module.exports = {
  lintOnSave: false,
  devServer: {
    host: "localhost",
    port: 8080,
    https: false,
    hotOnly: false,
    open: false,
    
  },
  chainWebpack: (config) => {
    //配置别名
    config.resolve.alias
      .set("@", resolve("src"))
      .set("assets", resolve("src/assets"))
      .set("comp", resolve("src/components"))
      .set("utils", resolve("src/utils"));
  },
};
