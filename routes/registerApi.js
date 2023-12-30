const express = require("express");
const router = express.Router();
const createError = require("http-errors");
// 引入svg验证码包
const svgCaptcha = require("svg-captcha");
const UserModel = require("../database/model/UserModel");

router.post("/register", function (req, res, next) {
  const { userName, passWord, code } = req.body;
  // img_code 获取传递的图片验证码 ,如果不相等，验证码错误
  if (String(code).toLocaleUpperCase() !== req.session.img_code) {
    res.send({
      status: 201,
      msg: "验证码错误",
    });
    return;
  }

  const addUser = new UserModel({
    userName,
    passWord,
  });

  addUser
    .save({ validateBeforeSave: true })
    .then((result) => {
      res.send({
        status: 200,
        data: result,
        msg: "success",
      });
    })
    .catch((error) => {
      if (!userName || !passWord) {
        res.send({
          status: 201,
          msg: "please check userName or password",
        });
        return;
      }
      console.log("/register", "error");
      next(createError(500));
    });
});

router.get("/getCode", (req, res) => {
  const captcha = svgCaptcha.create({
    noise: 3, // 干扰线条的数量
    background: "white", // 背景颜色
  });
  // 将图片的验证码存入到 session 中
  req.session.img_code = captcha.text.toLocaleUpperCase(); // 将验证码装换为大写
  // 设置响应头
  res.type("svg");
  res.send(captcha.data);
});

module.exports = router;