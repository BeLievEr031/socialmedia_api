import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please Enter Email"],
    unique: [true, "Email Already Exists"],
  },
  password: {
    type: String,
    required: [true, "Please Enter password"],
    minlength: [6, "Enter password more than 6 digit"],
    select: false,
  },

  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostModel",
    },
  ],

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
  ],

  resetToken: String,
  tokenExpiresIn: Date,
});

const UserModel = new mongoose.model("UserModel", userSchema);

export default UserModel;
