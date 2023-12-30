const registerApi = require("./registerApi");

// 挂在接口
function mountApi(app) {
  app.use('/api',registerApi);
}

module.exports = mountApi;
