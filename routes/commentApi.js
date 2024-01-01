const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { verifyToken, getTokenMsg } = require("../middleware/validateToken");
const { sortPageLimitPipelineFunc, mergeArrays } = require("../utils/index");
const { errorFunc } = require("../utils/index");

// Model
const CommentModel = require("../database/model/CommentModel");
const CommentLikeModel = require("../database/model/CommentLikeModel");

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
  console.log(123);
  let user_id = 0;
  if (req.headers["authorization"]) {
    user_id = getTokenMsg(req.headers["authorization"]);
  }

  console.log(user_id);

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
        $lookup: {
          from: "comment_likes",
          localField: "comment_id",
          foreignField: "comment_id",
          as: "likes",
        },
      },
      {
        $addFields: {
          likes_count: { $size: "$likes" },
          current_user_like_status: {
            $cond: [{ $in: [user_id, "$likes.user_id"] }, true, false],
          },
        },
      },
      {
        $project: {
          _id: 1,
          createDate: 1,
          parent_id: 1,
          to_user_id: 1,
          content: 1,
          likes_count: 1,
          current_user_like_status: 1,
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
 * @params content [String] required
 * @params parent_id [String] default:"0"
 * @params to_user_id [String]
 */
router.post("/addComment", verifyToken, async (req, res, next) => {
  const { _id } = getTokenMsg(req.headers["authorization"]);
  const { article_id, content, parent_id, to_user_id, like } = req.body;
  const addComment = new CommentModel({
    article_id,
    user_id: _id,
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

/**
 * @params comment_id [String] required
 */
//删除评论
router.delete("/deleteComment", verifyToken, async (req, res, next) => {
  const { _id: user_id } = getTokenMsg(req.headers["authorization"]);
  const { comment_id } = req.body;
  try {
    const currentComment = await CommentModel.aggregate([
      {
        $match: {
          _id: comment_id,
        },
      },
    ]).exec();
    if (currentComment.length === 0) {
      res.send({
        status: "201",
        msg: `暂无该评论的信息，或者该评论已被删除评论_id为 ${comment_id}`,
      });
      return;
    }
    if (user_id === currentComment[0].user_id) {
      const result = await CommentModel.deleteOne({ _id: comment_id });
      res.send({
        status: "200",
        msg: "删除成功",
      });
    } else {
      res.send({
        status: 201,
        msg: "该用户并不拥有该条评论，所以不能删除哦",
      });
    }
  } catch (error) {
    console.log("/deleteComment", error);
    next(createError(500));
  }
});

// 评论点赞接口
/**
 * @params comment_id [String] required
 * @params like [Number] [0,1]
 * @params article_id [String] required
 */

router.post("/commentLike", verifyToken, async (req, res, next) => {
  const { like, comment_id, article_id } = req.body;
  const { user_id } = getTokenMsg(req.headers["authorization"]);
  if (~~like) {
    const isLike = await CommentLikeModel.aggregate([
      {
        $match: {
          user_id,
          comment_id,
        },
      },
    ]);
    if (isLike.length) {
      res.send({
        status: 201,
        msg: "你已经点赞了",
      });
      return;
    }

    // 添加评论点赞数据
    const addLike = new CommentLikeModel({
      user_id,
      article_id,
      comment_id,
    });
    try {
      await addLike.save();
      res.send({
        status: 200,
        msg: "点赞成功",
      });
    } catch (error) {
      errorFunc(res, "/commentLike", error);
    }
  }
});
module.exports = router;
