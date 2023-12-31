const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema(
  {
    createDate: {
      type: Number,
      required: true,
    },
    article_id: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    parent_id: {
      type: Number,
      required: true,
      default: 0,
    },
    conntent: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      require: true,
    },
    to: {
      type: String,
    },
    like: {
      type: Number,
    },
  },
  { versionKey: false }
);

const ArticleModel = mongoose.model("comments", CommentSchema);

module.exports = ArticleModel;
