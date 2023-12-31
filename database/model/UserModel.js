const mongoose = require("mongoose");
const role = require("../../utils/role");

const UserSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      unique: true,
      index: true,
      default: () => new mongoose.Types.ObjectId().toString(), // 使用 default 属性
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    passWord: {
      type: String,
      required: true,
    },
    avator: {
      type: String,
      default: () => "",
    },
    createDate: {
      type: Number,
      default: () => new Date().getTime(),
    },
    role: {
      type: String,
      default: role.user,
    },
  },
  { versionKey: false }
);

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
