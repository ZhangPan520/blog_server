const registerApi = require("./registerApi");

// 挂在接口
function mountApi(app) {
  app.use(registerApi);
}

module.exports = mountApi;
