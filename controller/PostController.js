import PostModel from "../models/PostModel.js";
import UserModel from "../models/UserModel.js";
class PostController {
  static uploadPost = async (req, res) => {
    const user = req.user;
    const userID = user._id;
    const { caption } = req.body;

    if (caption) {
      try {
        const postData = {
          caption: caption,
          owner: userID,
        };

        const newPost = new PostModel(postData);
        await newPost.save();

        user.post.push(newPost._id);
        await user.save();

        res.json({
          status: true,
          msg: "post created",
          post: newPost,
        });
      } catch (err) {
        res.json({
          status: false,
          msg: err.message,
        });
      }
    } else {
      res.json({
        status: false,
        msg: "All field requires..",
      });
    }
  };

  static likeAndUnlikePost = async (req, res) => {
    const postIDForLinkeAndUnlike = req.params.id;
    const userID = req.user._id;
    console.log(userID);
    const isValidPost = await PostModel.findById(postIDForLinkeAndUnlike);

    if (isValidPost) {
      const validPost = isValidPost;
      try {
        if (validPost.like.includes(userID)) {
          const index = validPost.like.indexOf(userID);
          validPost.like.splice(index, 1);
          await validPost.save();
          res.json({
            status: true,
            msg: "Post Unliked..",
          });
        } else {
          validPost.like.push(userID);
          await validPost.save();
          res.json({
            status: true,
            msg: "Post Liked..",
          });
        }
      } catch (err) {}
    } else {
      res.json({
        status: false,
        msg: "Post Not Found..",
      });
    }
  };

  static deletePost = async (req, res) => {
    const postIDForDelete = req.params.id;
    const postForDelete = await PostModel.findById(postIDForDelete);
    if (postForDelete) {
      const userID = req.user._id;
      if (userID.toString() != postForDelete.owner.toString()) {
        return res.json({
          status: false,
          msg: "Invalid Post..",
        });
      }
      await postForDelete.remove();
      const user = await UserModel.findById(userID);
      const index = user.post.indexOf(postIDForDelete);
      user.post.splice(index, 1);
      await user.save();
      res.json({
        status: false,
        msg: "Post Deleted..",
      });
    } else {
      res.json({
        status: false,
        msg: "Post Not Found...",
      });
    }
  };

  static updateCaption = async (req, res) => {
    try {
      const postID = req.params.id;
      const post = await PostModel.findById(postID);

      if (!post) {
        return res.json({
          status: false,
          msg: "Invalid Popst",
        });
      }

      const userID = req.user._id;
      if (post.owner.toString() !== userID.toString()) {
        return res.json({
          status: false,
          msg: "Unauthorized..",
        });
      }

      const { caption } = req.body;
      post.caption = caption;
      await post.save();

      res.json({
        status: true,
        msg: "Caption Updated...",
      });
    } catch (error) {
      res.json({
        status: false,
        msg: error.message,
      });
    }
  };

  static addComment = async (req, res) => {
    try {
      const userID = req.user._id;
      const postID = req.params.id;
      const post = await PostModel.findById(postID);

      if (!post) {
        return res.json({
          status: false,
          msg: "Post Not found",
        });
      }

      const { comment } = req.body;

      let isAlreadyCommentedIndex = -1;

      post.comments.forEach((item, index) => {
        if (item.user.toString() === userID.toString()) {
          isAlreadyCommentedIndex = index;
        }
      });

      if (isAlreadyCommentedIndex !== -1) {
        post.comments[isAlreadyCommentedIndex].comment = comment;
        await post.save();
        res.json({
          status: true,
          msg: "comment updated",
        });
      } else {
        post.comments.push({
          user: userID,
          comment: comment,
        });

        await post.save();
        res.json({
          status: true,
          msg: "comment added",
        });
      }
    } catch (err) {
      res.json({
        status: false,
        msg: err.message,
      });
    }
  };

  static deleteComment = async (req, res) => {
    try {
      const postID = req.params.id;
      const post = await PostModel.findById(postID);
      const userID = req.user._id;

      if (!post) {
        return res.json({
          status: false,
          msg: "Post NOt model..",
        });
      }

      if (post.owner.toString() === userID.toString()) {
        const { commentID } = req.body;

        if (!commentID) {
          return res.json({
            status: false,
            msg: "Comment Not found",
          });
        }

        let isCommentExist = false;

        post.comments.forEach((item, index) => {
          if (item._id.toString() === commentID.toString()) {
            isCommentExist = true;
            return post.comments.splice(index, 1);
          }
        });

        if (!isCommentExist) {
          return res.json({
            status: false,
            msg: "Comment not found",
          });
        }

        await post.save();
        res.json({
          status: true,
          msg: "Selected comment deleted..",
        });
      } else {
        post.comments.forEach((item, index) => {
          if (item.user.toString() === userID.toString()) {
            return post.comments.splice(index, 1);
          }
        });
        await post.save();
        res.json({
          status: true,
          msg: "Comment deleted..",
        });
      }
    } catch (err) {
      res.json({
        status: false,
        msg: err.message,
      });
    }
  };
}
export default PostController;
