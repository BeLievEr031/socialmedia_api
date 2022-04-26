import express from "express";
import UserController from "../controller/UserController.js";
import isAuthenticate from "../middleware/isAuthenticate.js";
const userRouter = express.Router();

// Router level middleware
userRouter.use("/follow/:id", isAuthenticate);
userRouter.use("/posts", isAuthenticate);
userRouter.use("/update/password", isAuthenticate);
userRouter.use("/update/profile", isAuthenticate);


// Register user
userRouter.route("/auth/register").post(UserController.registerUser);
userRouter.route("/auth/login").post(UserController.loginUser);

// Router for the follow and unfollow
userRouter.route("/follow/:id").get(UserController.FollowAndUnfollow);

// Router to get the all posts from following
userRouter.route("/posts").get(UserController.getAllPostsOfFollowing);

// Router to log-out the user
userRouter.route("/logout").get(UserController.logoutUser);

// Routers for updating the User
userRouter.route("/update/password").put(UserController.updatePassword);
userRouter.route("/update/profile").put(UserController.updateProfile);

//Router for the getting login user profile details
userRouter.route("/me").get(isAuthenticate,UserController.showMyProfile); 

// Router for getting other users deatils
userRouter.route("/detail/:id").get(isAuthenticate,UserController.getUserDeatails);

// Router for gettting all the users
userRouter.route("/detail/users").get(UserController.getAllUsers);

// Router for delete the own profile
userRouter.route("/delete/me").delete(isAuthenticate, UserController.deleteMyProfile);

// Router for reset and Forget Password 
userRouter.route("/forget/password").post(UserController.sendResetLinkToEmail);
userRouter.route("/reset/password/:id/:token").put(UserController.resetPassword);

export default userRouter;
