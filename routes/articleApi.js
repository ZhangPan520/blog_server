const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { createToken } = require("../middleware/validateToken");
const ArtileModel = require("../database/model/ArtileModel");

// 获取文章

router.get("/getArticle", async (req, res, next) => {
  let totalCount = 0;
  //   设置排序方式
  //page:Number
  //limit:Number
  //sort:1正序 -1倒叙
  let {
    page = 0,
    limit = 0,
    sortFiled = "createDate",
    sortMethod = 1,
    searchKey,
  } = req.query;

  const pageInfo = (() => {
    const pageInfo = {};
    if (page) pageInfo.page = ~~page;
    if (limit) pageInfo.limit = ~~limit;
    if (sortFiled) pageInfo.sortFiled = sortFiled;
    if (sortMethod) pageInfo.sortMethod = ~~sortMethod;
    if (Object.keys(pageInfo).length) return pageInfo;
    return undefined;
  })();

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

    pipeline.push(
      // 排序
      {
        $sort: {
          [sortFiled]: Number(-~~sortMethod), // 正序排序，-1 为倒序排序
        },
      }
    );

    if (page) {
      pipeline.push(
        // 分页
        {
          $skip: (page - 1) * Number(~~limit),
        }
      );
    }
    if (~~limit) {
      //   限制返回条数;
      pipeline.push({
        $limit: parseInt(~~limit),
      });
    }
    return pipeline;
  })();

  try {
    const docs = await ArtileModel.aggregate(pipeline).exec();
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
