const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { verifyToken } = require("../middleware/validateToken");
const { sortPageLimitPipelineFunc, mergeArrays } = require("../utils/index");
const CommentModel = require("../database/model/CommentModel");

// 通过ArticleId获取评论
/**
 * @params article_id [String] required
 * @params page [Number]
 * @params limit Number
 * @params sortField [String] ["like","createDate"] default:createDate
 * @params sortMethod [Number] [1,-1]
 */

router.get("/getCommentByArticleId", async (req, res, next) => {
  const { article_id = 0 } = req.query;
  const { pageInfo, sortPageLimitPipeline } = sortPageLimitPipelineFunc(req);

  // 查询数据
  try {
    // 查询对应article_id的所有数据
    const totalDocs = await CommentModel.aggregate([
      { $match: { article_id, parent_id: "0" } },
    ]).exec();

    const totalCount = totalDocs.length;
    const docs = await CommentModel.aggregate([
      { $match: { article_id } },
      {
        $addFields: {
          convertedId: { $toObjectId: "$localField" },
        },
      },
      {
        $lookup: {
          from: "users", // b表的名称
          localField: "user_id", // a表中的字段
          foreignField: "_id", // b表中的字段
          as: "userInfo", // 关联后存放结果的字段名
        },
      },
      {
        $lookup: {
          from: "users", // b表的名称
          localField: "to_user_id", // a表中的字段
          foreignField: "_id", // b表中的字段
          as: "toUserInfo", // 关联后存放结果的字段名
        },
      },
      {
        $project: {
          _id: 1,
          createDate: 1,
          parent_id: 1,
          to_user_id: 1,
          content: 1,
          like: 1,
          userInfo: {
            _id: 1,
            userName: 1,
            avator: 1,
          },
          toUserInfo: {
            _id: 1,
            userName: 1,
            avator: 1,
          },
        },
      },
      ...sortPageLimitPipeline,
    ]).exec();

    // 一级评论
    const firstComments = docs.filter((comment) => comment.parent_id === "0");
    const count = firstComments.length;
    // 二级评论
    const secondComments = docs.filter((comment) => comment.parent_id !== "0");
    // 对二级评论进行排序  按照时间由大到小进行排序，主要是为了二级评论的展示顺序
    secondComments.sort((a, b) => a.createDate - b.createDate);

    // 将二级评论合并到一级评论的子级中
    const data = mergeArrays(firstComments, secondComments, "_id", "parent_id");
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

// 新增评论
/**
 * @params article_id [String] required
 * @params user_id [String] required
 * @params content [String] required
 * @params parent_id [String] default:"0"
 * @params to_user_id [String]
 */
router.post("/addComment", verifyToken, async (req, res, next) => {
  const { article_id, user_id, content, parent_id, to_user_id, like } =
    req.body;
  const addComment = new CommentModel({
    article_id,
    user_id,
    content,
    parent_id,
    to_user_id,
    like,
  });
  try {
    await addComment.save();
    res.send({
      status: 200,
      msg: "success",
    });
  } catch (error) {
    console.log("/addComment", error);
    next(createError(500));
  }
});

module.exports = router;
