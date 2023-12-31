const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { createToken } = require("../middleware/validateToken");
const { sortPageLimitPipelineFunc, mergeArrays } = require("../utils/index");
const CommentModel = require("../database/model/CommentModel");

router.get("/getCommentByArticleId", async (req, res, next) => {
  const { article_id = 0 } = req.query;
  const { pageInfo, sortPageLimitPipeline } = sortPageLimitPipelineFunc(req);

  // 查询数据
  try {
    // 查询对应article_id的所有数据
    console.log(article_id);
    const docs = await CommentModel.aggregate([
      { $match: { article_id } },
      ...sortPageLimitPipeline,
    ]).exec();

    const totalDocs = await CommentModel.aggregate([
      { $match: { article_id, parent_id: "0" } },
    ]).exec();
    const totalCount = totalDocs.length;

    // 一级评论
    const firstComments = docs.filter((comment) => comment.parent_id === "0");
    const count = firstComments.length;
    // 二级评论
    const secondComments = docs.filter((comment) => comment.parent_id !== "0");
    // 对二级评论进行排序  按照时间由大到小进行排序，主要是为了二级评论的展示顺序
    secondComments.sort((a, b) => a.createDate - b.createDate);

    // 将二级评论合并到一级评论的子级中
    const data = mergeArrays(firstComments, secondComments, "_id", "parent_id");
    console.log(data);
    res.send({
      status: 200,
      data: data,
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
