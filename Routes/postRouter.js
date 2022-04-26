import express from "express";
import PostController from "../controller/PostController.js";
import isAuthenticate from "../middleware/isAuthenticate.js";
const postRouter = express.Router();

// Route level Middleware
postRouter.use("/upload", isAuthenticate);
postRouter.use("/:id", isAuthenticate);

// For Uploading the post
postRouter.route("/upload").post(PostController.uploadPost);

// FOR OPERATIONS ON POST
postRouter
  .route("/:id")
  .post(PostController.likeAndUnlikePost)
  .delete(PostController.deletePost);

// For updating the caption
postRouter
  .route("/update/caption/:id")
  .put(isAuthenticate, PostController.updateCaption);

//For adding comment on post
postRouter
  .route("/comment/:id")
  .put(isAuthenticate, PostController.addComment)
  .delete(isAuthenticate, PostController.deleteComment);

export default postRouter;
