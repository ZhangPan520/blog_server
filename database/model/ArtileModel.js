const mongoose = require("mongoose");

const ArticleMSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      unique: true,
      index: true,
      default: () => new mongoose.Types.ObjectId().toString(), // 使用 default 属性
    },
    article_id: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        return this._id;
      },
    },
    title: {
      type: String,
      required: true,
    },
    createDate: {
      type: Number,
      default: () => new Date().getTime(),
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
    tags: {
      type: Array,
      default: [],
    },
    view_count: Number,
    collect_count: Number,
  },
  { versionKey: false }
);

const ArticleModel = mongoose.model("articles", ArticleMSchema);

module.exports = ArticleModel;
