const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const { createToken } = require("../middleware/validateToken");
const CommentModel = require("../database/model/CommentModel");



router.get("/getCommentByArticleId", (req, res, next) => {
  searchFun(
    req,
    res,
    next,
    "/getCommentByArticleId",
    CommentModel,
    "_id",
    article_id
  );
});

module.exports = router;
