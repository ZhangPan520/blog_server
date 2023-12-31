const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      unique: true,
      index: true,
      default: () => new mongoose.Types.ObjectId().toString(), // 使用 default 属性
    },
    createDate: {
      type: Number,
      default: () => new Date().getTime(),
    },
    article_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    parent_id: {
      type: String,
      required: true,
      default: "0",
    },
    content: {
      type: String,
      required: true,
    },
    to_user_id: {
      type: String,
      default: "",
    },
    like: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false }
);

const ArticleModel = mongoose.model("comments", CommentSchema);

module.exports = ArticleModel;
