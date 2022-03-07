const path = require("path");
const resolve = (dir) => path.join(__dirname, dir);
module.exports = {

  extends: [
    "plugin:vue/essential",
    //关闭ESlint关键代码
    // '@vue/standard'
  ],
  parserOptions: {
    parser: "babel-eslint",
  },
  rules: {
    //严格的检查缩进问题，不是报错，我们可以关闭这个检查规则,然后在终端输入npm run dev
    indent: ["off", 2],
    //使用eslint时，严格模式下，报错Missing space before function parentheses的问题，意思是在方法名和刮号之间需要有一格空格。
    "space-before-function-paren": 0,
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    //关闭prettier
    "prettier/prettier": "true",
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
