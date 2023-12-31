const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { searchFun } = require("../utils/index");
const { createToken } = require("../middleware/validateToken");
const CommentModel = require("../database/model/CommentModel");

router.get("/getCommentByArticleId", (req, res, next) => {
  const { article_id = 0 } = req.query;
  const pipeline = [
    {
      $match: {
        article_id,
      },
    },
  ];
  searchFun(
    req,
    res,
    next,
    "/getCommentByArticleId",
    CommentModel,
    pipeline,
    pipeline
  );
});

module.exports = router;
