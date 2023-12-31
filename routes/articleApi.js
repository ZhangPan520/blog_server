const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { createToken } = require("../middleware/validateToken");
const ArtileModel = require("../database/model/ArtileModel");
const { sortPageLimitPipelineFunc } = require("../utils/index");

// 获取文章

router.get("/getArticle", async (req, res, next) => {
  let totalCount = 0;
  //   设置排序方式
  //page:Number
  //limit:Number
  //sort:1正序 -1倒叙
  let { searchKey } = req.query;

  if (searchKey) {
    const docs = await ArtileModel.find({
      $or: [
        { title: { $regex: searchKey, $options: "i" } },
        { content: { $regex: searchKey, $options: "i" } },
      ],
    }).exec();
    totalCount = docs.length;
  } else {
    const docs = await ArtileModel.find().exec();
    totalCount = docs.length;
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

    return pipeline;
  })();

  const { pageInfo, sortPageLimitPipeline } = sortPageLimitPipelineFunc(req);
  try {
    const docs = await ArtileModel.aggregate([
      ...pipeline,
      ...sortPageLimitPipeline,
    ]).exec();
    const count = docs.length;
    res.send({
      status: 200,
      data: docs,
      totalCount,
      count,
      pageInfo,
      msg: "success",
    });
  } catch (error) {
    console.log("/getArticle", error);
    next(createError(500));
  }
});

module.exports = router;
