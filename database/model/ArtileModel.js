const mongoose = require("mongoose");

const ArticleMSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
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
    tag_id: {
      type: String,
      required: true,
      unique: true,
    },
    conntent: {
      type: String,
      required: true,
    },
    view_count: Number,
    collect_count: Number,
  },
  { versionKey: false }
);

const ArticleModel = mongoose.model("articles", ArticleMSchema);

module.exports = ArticleModel;
