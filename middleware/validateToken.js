const jwtToken = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const secretKey = "jwttoken_secret";

function createToken(payload) {
  return jwtToken.sign(payload, secretKey, { expiresIn: "0.5h" });
}

function verifyToken(req, res, next) {
  // 当我写了callBack 和token参数后 路由校验时就不会进这个函数了，应该是去校验了函数的参数长度所以用arguments来接受参数
  //arguments[4] 请传入token，arguments[3] 请传入回调函数  这两个参数基本上用不到，为了扩展写的
  token = req.headers["authorization"] || arguments[4];

  if (!token) {
    return res.sendStatus(401);
  }
  callBack =
    arguments[3] ||
    function (error) {
      if (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(403).send("Token expired");
        } else {
          return res.sendStatus(403);
        }
      }
      next();
    };

  jwtToken.verify(token, secretKey, callBack);
}

module.exports = {
  createToken,
  verifyToken,
};
