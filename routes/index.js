const registerApi = require("./loginRegisterGetCodeApi");
const articleApi = require("./articleApi");
const commentApi = require("./commentApi");

// 挂在接口
function mountApi(app) {
  app.use("/api", registerApi);
  // 博客文章api
  app.use("/api", articleApi);
  //评论api
  app.use("/api", commentApi);
}

module.exports = mountApi;
