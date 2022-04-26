import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import PostModel from "../models/PostModel.js";

class UserController {
  static registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (name && email && password) {
      try {
        const isUserAlreadyExists = await UserModel.findOne({ email: email });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        if (!isUserAlreadyExists) {
          const newUserData = {
            name: name,
            email: email,
            password: hashedPassword,
          };
          const newUser = new UserModel(newUserData);
          await newUser.save();
          res.json({
            status: true,
            msg: "user added",
            user: newUser,
          });
        } else {
          res.json({
            status: false,
            msg: "User Already Exists..",
          });
        }
      } catch (err) {
        res.json({
          status: false,
          msg: err.message,
          xyz: "dh",
        });
      }
    } else {
      res.json({
        status: false,
        msg: "all field require",
      });
    }
  };

  static loginUser = async (req, res) => {
    console.log(req.ip);
    const { email, password } = req.body;

    if (email && password) {
      try {
        const isUserExists = await UserModel.findOne({ email: email }).select(
          "+password"
        );

        if (isUserExists) {
          const isValidPassword = await bcrypt.compare(
            password,
            isUserExists.password
          );

          if (isValidPassword) {
            const token = jwt.sign(
              { userID: isUserExists._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "2h" }
            );
            await res.cookie("token", token);

            res.json({
              status: true,
              msg: "User Login",
              user: isUserExists,
            });
          } else {
            res.json({
              status: false,
              msg: "Login Failed. Wrong Credentials...",
            });
          }
        } else {
          res.json({
            status: false,
            msg: "Login Failed. Wrong Credentials...",
          });
        }
      } catch (err) {
        res.json({
          status: false,
          msg: err.message,
        });
      }
    } else {
      res.json({
        status: false,
        msg: "Login Failed. All fields required..",
      });
    }
  };

  static logoutUser = (req, res) => {
    try {
      // req.logout();
      res.clearCookie("token");
      res.json({
        status: true,
        msg: "User logged Out",
      });
    } catch (err) {
      res.json({
        status: false,
        msg: err.message,
      });
    }
  };

  static FollowAndUnfollow = async (req, res) => {
    const userID = req.user._id;
    const userIDToFollow = req.params.id;
    console.log(userID, "$$", userIDToFollow);
    if (userID.toString() === userIDToFollow.toString()) {
      return res.json({
        status: true,
        msg: "Already Followed",
      });
    }

    try {
      const isFollowUserExists = await UserModel.findById(userIDToFollow);
      const userWhoFollow = await UserModel.findById(userID);

      if (isFollowUserExists && userWhoFollow) {
        const followUser = isFollowUserExists;

        if (userWhoFollow.following.includes(followUser._id)) {
          // Deleting from the FollowingDB
          const indexOfFollowing = userWhoFollow.following.indexOf(
            followUser._id
          );
          userWhoFollow.following.splice(indexOfFollowing, 1);
          await userWhoFollow.save();

          // Deleting from the FollowersDB
          const indexOfFollower = followUser.followers.indexOf(
            userWhoFollow._id
          );
          followUser.followers.splice(indexOfFollower, 1);
          await followUser.save();

          res.json({
            status: true,
            msg: "User unfollowed...",
          });
        } else {
          followUser.followers.push(userWhoFollow._id);
          userWhoFollow.following.push(followUser._id);

          await userWhoFollow.save();
          await followUser.save();

          res.json({
            status: true,
            msg: "User followed...",
          });
        }
      } else {
        res.json({
          status: false,
          msg: "User Not found for following...",
        });
      }
    } catch (err) {
      res.json({
        status: false,
        msg: err.message,
      });
    }
  };

  static getAllPostsOfFollowing = async (req, res) => {
    const userID = req.user._id;
    const loginUser = await UserModel.findById(userID);
    const arrFollowing = loginUser.following;

    const allPost = await PostModel.find({
      owner: arrFollowing,
    });

    res.json({
      staus: true,
      post: allPost,
    });
  };

  static updatePassword = async (req, res) => {
    const userID = req.user._id;

    try {
      const user = await UserModel.findById(userID).select("+password");
      const { oldPassword, newPassword } = req.body;
      const isOldPassword = await bcrypt.compare(oldPassword, user.password);

      if (!isOldPassword) {
        return res.json({
          status: false,
          msg: "Invalid oldPasword..",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({
        status: true,
        msg: "Password Updated..",
      });
    } catch (err) {
      res.json({
        status: false,
        msg: err.message,
      });
    }
  };

  static updateProfile = async (req, res) => {
    const userID = req.user._id;
    const user = await UserModel.findById(userID);
    const { name, email } = req.body;

    if (email) {
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    await user.save();
    res.json({
      status: true,
      msg: "Profile Updated..",
    });
  };

  static showMyProfile = async (req, res) => {
    try {
      const userID = req.user._id;
      const user = await UserModel.findById(userID).populate("post");
      res.json({
        staus: true,
        msg: user,
      });
    } catch (err) {
      res.json({
        status: false,
        msg: err.message,
      });
    }
  };

  static deleteMyProfile = async (req, res) => {
    try {
      const userID = req.user._id;
      const user = await UserModel.findById(userID);
      const post = user.post;
      const userFollowing = user.following;
      const userFollower = user.followers;
      res.clearCookie("token");
      await user.remove();

      for (let i = 0; i < post.length; i++) {
        const postToRemove = await PostModel.findById(post[i]);
        await postToRemove.remove();
      }

      for (let i = 0; i < userFollower.length; i++) {
        const follwerForRemove = await UserModel.findById(userFollower[i]);
        const index = follwerForRemove.following.indexOf(userID);
        follwerForRemove.following.splice(index, 1);
        await follwerForRemove.save();
      }

      for (let i = 0; i < userFollowing.length; i++) {
        const followingForRemove = await UserModel.findById(userFollowing[i]);
        const index = followingForRemove.followers.indexOf(userID);
        followingForRemove.followers.splice(index, 1);
        await followingForRemove.save();
      }

      res.json({
        staus: true,
        msg: "Profile Deleted..",
      });
    } catch (err) {
      res.json({
        status: false,
        msg: err.message,
      });
    }
  };

  static getUserDeatails = async (req, res) => {
    try {
      const userID = req.params.id;
      const user = await UserModel.findById(userID).populate("post");
      if (!user) {
        res.json({
          status: false,
          msg: "User Not found..",
        });
      }

      res.json({
        staus: true,
        userDetails: user,
      });
    } catch (err) {
      res.json({
        status: false,
        msg: err.message,
      });
    }
  };

  static getAllUsers = async (req, res) => {
    try {
      const allUser = await UserModel.find({});

      res.json({
        staus: true,
        users: allUser,
      });
    } catch (err) {
      res.json({
        status: false,
        msg: err.message,
      });
    }
  };

  static sendResetLinkToEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      try {
        const isUser = await UserModel.findOne({ email: email });
        console.log(isUser);
        if (isUser) {
          const secret_key = isUser._id + process.env.JWT_SECRET_KEY;
          const token = jwt.sign({ userID: isUser._id }, secret_key, {
            expiresIn: "15m",
          });
          const link = `http://localhost:3000/${isUser._id}/${token}`;

          console.log(link);
          res.send("64");

          try {
            let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
              service: "gmail",
              host: "smtp.gmail.com",
              port: 587,
              secure: false, // true for 465, false for other ports
              auth: {
                user: "sandyrajak031@gmail.com", // generated ethereal user
                pass: "hzexjhjhjpprxnhk", // hzexjhjhjpprxnhk
              },
            });

            let info = await transporter.sendMail({
              from: "sandyrajak031@gmail.com", // sender address
              to: "sandyrajak031@gmail.com", // list of receivers
              subject: "Password Reset Link", // Subject line
              text: "Hello there click on the link to reset the your password \n\n", // plain text body
              html: `<a>${link}</a>`, // html body
            });

            console.log(link);
            res.json({
              status: "sucsess",
              msg: `link sent..`,
              link: link,
            });
          } catch (error) {
            res.json({
              status: "Failed..",
              err: err.message,
            });
          }
        } else {
          res.json({
            status: "Failed",
            msg: "User Not Found..",
          });
        }
      } catch (err) {
        res.json({
          status: "Failed------------>",
          err: err,
        });
      }
    } else {
      res.json({
        status: "Failed",
        msg: "All field required...",
      });
    }
  };

  static resetPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;

    if (password && confirmPassword) {
      if (confirmPassword === password) {
        const { id, token } = req.params;
        const user = await UserModel.findById(id);

        if (user) {
          const secret_key = user._id + process.env.JWT_SECRET_KEY;
          const isValidToken = jwt.verify(token, secret_key);
          console.log(isValidToken);
          if (isValidToken != null) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await UserModel.findByIdAndUpdate(id, {
              $set: { password: hashedPassword },
            });
            res.json({
              status: "Success",
              msg: "password change",
            });
          } else {
            res.json({
              status: "Failed",
              msg: "Wrong token..",
            });
          }
        } else {
          res.json({
            status: "Failed",
            msg: "Wrong Credentials..",
          });
        }
      } else {
        res.json({
          status: "Failed",
          msg: "All Field Requires..",
        });
      }
    } else {
      res.json({
        status: "Failed",
        msg: "Wrong Credentials..",
      });
    }
  };
}

export default UserController;
