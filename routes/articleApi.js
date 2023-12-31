const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { createToken } = require("../middleware/validateToken");
const { searchFun } = require("../utils/index");
const ArtileModel = require("../database/model/ArtileModel");

// 获取文章

router.get("/getArticle", async (req, res, next) => {
  let totalCount = 0;
  //   设置排序方式
  let { searchKey } = req.query;
  let totalCountPipeLine = [];

  if (searchKey) {
    totalCountPipeLine.push({
      $match: {
        $or: [
          { title: { $regex: new RegExp(searchKey, "i") } }, // 忽略大小写
          { content: { $regex: new RegExp(searchKey, "i") } },
        ],
      },
    });
  }

  const pipeline = (() => {
    // 根据关键词模糊查询
    let pipeline = [];
    // 根据关键词进行查询

    if (searchKey) {
      // 查询title和content中满足条件的内容
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: new RegExp(searchKey, "i") } }, // 忽略大小写
            { content: { $regex: new RegExp(searchKey, "i") } },
          ],
        },
      });
    }
  })();

  searchFun(
    req,
    res,
    next,
    "/getArticle",
    ArtileModel,
    pipeline,
    totalCountPipeLine
  );
});

module.exports = router;
