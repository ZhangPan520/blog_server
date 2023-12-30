const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const UserModel = require("../database/model/UserModel");

router.post("/register", function (req, res, next) {
  const { userName, passWord } = req.body;
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

module.exports = router;
