import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

const isAuthenticate = async (req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    try {
      const user = await UserModel.findById(userID);
      req.user = user;
      next();
    } catch (err) {
      res.json({
        status: false,
        msg: "invalid Token",
      });
    }
  } else {
    res.json({
      staus: false,
      msg: "Login First",
    });
  }
};

export default isAuthenticate;
