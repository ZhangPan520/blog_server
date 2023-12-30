const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
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
  },
  { versionKey: false }
);

const UserModel = mongoose.model("User", UserSchema, "user");

module.exports = UserModel;
