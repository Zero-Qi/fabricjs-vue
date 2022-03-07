const path = require("path");
const resolve = (dir) => path.join(__dirname, dir);
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential"], // "@vue/prettier"
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  devServer: {
    host: "localhost",
    port: 8080,
    https: false,
    hotOnly: false,
    open: false,
    proxy: {
      "/api": {
        target: "http://192.168.134.99:8085",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/",
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
      .set("utils", resolve("src/utils"));
  },
};
