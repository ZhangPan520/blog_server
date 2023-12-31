const mongoose = require("mongoose");

const CommentLikeSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    index: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  common_like_id: {
    type: String,
    unique: true,
    index: true,
    default: function () {
      return this._id;
    },
  },
  user_id: {
    type: String,
    required: true,
  },
  article_id: {
    type: String,
    required: true,
  },
  comment_id: {
    type: String,
    required: true,
  },
});

const CommentLikeModel = mongoose.model("comment_likes", CommentLikeSchema);
module.exports = CommentLikeModel;
