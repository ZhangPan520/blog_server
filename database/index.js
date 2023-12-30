const mongoose = require("mongoose");

// 数据库配置信息
const dbConfig = {
  userName: "",
  pwd: "",
  dbName: "blog",
  //注意不要加后缀/
  ip: "127.0.0.1:27017",
};

// 拼接数据库地址
const dbUrl = (() => {
  const { ip, userName, pwd, dbName } = dbConfig;
  let dbUrl;
  if (pwd) {
    dbUrl = `mongodb://${userName}:{${pwd}}@${ip}/${dbName}`;
    return dbUrl;
  }

  dbUrl = `mongodb://${ip}/${dbName}`;
  return dbUrl;
})();

// 连接mongodb数据库
function connectDabase() {
  mongoose.connect(dbUrl);
  const db = mongoose.connection;

  //   监听连接成功
  db.on("error", (error) => {
    console.error("连接失败，请检查配置信息");
    console.log(error);
  });
  //   db.once("once", () => {
  //     console.log("数据库连接成功");
  //   });

  // 监听连接成功事件
  mongoose.connection.on("connected", function () {
    console.log("MongoDB 连接成功");
  });

  // 监听连接断开事件
  mongoose.connection.on("disconnected", function () {
    console.log("MongoDB 连接断开");
  });
}
module.exports = { connectDabase };
