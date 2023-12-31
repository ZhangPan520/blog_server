const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const mongoose = require("mongoose");
const { createToken } = require("../../middleware/validateToken");
// 引入svg验证码包
const svgCaptcha = require("svg-captcha");
const UserModel = require("../../database/model/UserModel");

/**
 * @params userName [String] required
 * @params passWord [String] required
 */
// 登录接口
router.post("/login", async function (req, res, next) {
  const { userName, passWord } = req.body;
  try {
    const data = await UserModel.find({ userName, passWord }).exec();
    if (data.length > 0) {
      const { _id, userName, passWord } = data[0]._doc;

      // 根据用户输入的数据生成token
      const token = createToken({ _id, userName, passWord });
      res.send({
        status: 200,
        msg: "login success",
        token,
      });
    } else {
      res.send({
        status: 201,
        msg: "账号密码错误",
      });
    }
  } catch (error) {
    console.log("/login", error);
    next(createError(500));
  }
});

// 注册接口
/**
 * @params userName [String] required
 * @params passWord [String] required
 * @params code [String] required
 */
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
      // 清除img_code的验证码
      try {
        req.session.img_code = "";
      } catch (err) {
        console.log("req.session不存在", error);
      }
      res.send({
        status: 200,
        token: createToken(result._doc),
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
      console.log("/register", error);
      next(createError(500));
    });
});

// 获取二维码接口
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
