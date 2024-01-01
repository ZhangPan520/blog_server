const mongoose = require("mongoose");
const { customAlphabet } = require("nanoid");
// 使用数字字符集定义自定义函数
const generateNumericId = customAlphabet("0123456789", 6); // 设置ID长度为6

const ArticleMSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    index: true,
    default: () => generateNumericId(), // 使用 default 属性
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
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  view_count: {
    type: Number,
    default: 0,
  },
  user_id: {
    type: String,
    required: true,
  },
});

const ArticleModel = mongoose.model("articles", ArticleMSchema);

module.exports = ArticleModel;
