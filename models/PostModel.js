import mongoose from "mongoose";

let postSchema = new mongoose.Schema({
  caption: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },

      comment: {
        type: String,
        required: true,
      },
    },
  ],
  like: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
  ],
});

const PostModel = new mongoose.model("PostModel", postSchema);

export default PostModel;
