const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { errorFunc } = require("../utils/index");
const {
  createToken,
  verifyToken,
  getTokenMsg,
} = require("../middleware/validateToken");
const ArticleModel = require("../database/model/ArticleModel");
const { sortPageLimitPipelineFunc } = require("../utils/index");

// 获取文章

/**
 * @params page [Number]
 * @params limit Number
 * @params sortField [String] ["like","createDate"] default:createDate
 * @params sortMethod [Number] [1,-1]
 * @params searchKey [String]
 * @params tagKey [String]
 * des:描述 此接口中如果传入tagKey和searchKey那么tagKey和searchKey是与的关系，同时tagKey优先级高于searchKey
 */
router.get("/getArticle", async (req, res, next) => {
  let totalCount = 0;
  //   设置排序方式
  //page:Number
  //limit:Number
  //sort:1正序 -1倒叙
  let { searchKey, tagKey } = req.query;

  const searchLine = [{ $match: {} }];
  const tagLine = [{ $match: {} }];

  if (searchKey) {
    searchLine.push({
      $match: {
        $or: [
          { title: { $regex: searchKey, $options: "i" } },
          { content: { $regex: searchKey, $options: "i" } },
        ],
      },
    });
  }

  if (tagKey) {
    tagLine.push({
      $match: {
        tags: {
          $regex: tagKey,
          $options: "i",
        },
      },
    });
  }

  const docs = await ArticleModel.aggregate([...tagLine, ...searchLine]).exec();
  totalCount = docs.length;

  const { pageInfo, sortPageLimitPipeline } = sortPageLimitPipelineFunc(req);
  try {
    const docs = await ArticleModel.aggregate([
      ...tagLine,
      ...searchLine,
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

/**
 * @params title [String] required
 * @params content [String] required
 * @params user_id [String] required
 * @params tags String
 * des:多个tag请用,隔开 如:"vue,js,ajax"
 */
// 新增文章
router.post("/addArticle", verifyToken, async (req, res, next) => {
  const { title, content, tags } = req.body;
  const tagsHandle = tags.split(",");
  const { user_id } = getTokenMsg(req.headers["authorization"]);
  const addArticle = new ArticleModel({
    title,
    content,
    tags: tagsHandle,
    user_id,
  });
  try {
    const resData = await addArticle.save();
    res.send({
      status: 200,
      data: resData._doc,
      msg: "success",
    });
  } catch (error) {
    errorFunc(res, "/addArticle", error);
  }
});

/**
 * @params article_id [String] required
 * @params title [String]
 * @params content [String]
 * @params tags [String[]]
 * des:多个tag请用,隔开 如:"vue,js,ajax"
 */
// 编辑文章
router.put("/updateArticle", async (req, res, next) => {
  const { title, content, tags, article_id } = req.body;
  const tagsHandle = tags && tags.split(",");
  try {
    await ArticleModel.updateOne(
      { article_id },
      { title, content, tags: tagsHandle }
    );
    res.send({
      status: 200,
      msg: `更新article_id为${article_id}的文章成功`,
    });
  } catch (error) {
    errorFunc(res, "/updateArticle", error);
  }
});

/**
 * @params article_id [String]
 * des:删除文章
 */
router.delete("/deleteArticle", verifyToken, async (req, res, next) => {
  const { article_id } = req.body;
  console.log(article_id);
  const { user_id } = getTokenMsg(req.headers["authorization"]);
  console.log(user_id);
  try {
    const deleteMsg = await ArticleModel.deleteOne({
      article_id,
      user_id,
    });
    console.log(deleteMsg);
    // if()
    if (deleteMsg.deletedCount) {
      res.send({
        status: 200,
        msg: "success",
      });
    } else {
      errorFunc(res, "/deleteArticle", {
        message:
          "失败原因:1.请检查article_id和user_id是否已传。2.用户没有删除文章的权限。3.该文章已经被删除",
      });
    }
  } catch (error) {
    errorFunc(res, "/deleteArticle", error);
  }
});

/**
 * des:获取所有文章的tag标签
 */
router.get("/getAllArticleTags", async (req, res, next) => {
  try {
    const docs = await ArticleModel.aggregate([
      // 将标签数组展开为单独的文档
      { $unwind: "$tags" },
      // 统计每个标签的数量
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      // 将结果重构为对象数组
      {
        $project: {
          _id: 0,
          tag: "$_id",
          count: 1,
        },
      },
    ]);
    res.send({
      status: 200,
      data: docs,
      msg: "success",
    });
  } catch (error) {
    errorFunc(res, "/getAllTags", error);
  }
});

module.exports = router;
