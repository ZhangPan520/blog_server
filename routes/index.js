const registerApi = require("./loginRegisterGetCodeApi");
const articleApi = require("./articleApi");

// 挂在接口
function mountApi(app) {
  app.use("/api", registerApi);
  // 博客文章api
  app.use("/api", articleApi);
}

module.exports = mountApi;
