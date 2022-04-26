import mongoose from "mongoose";

const dbConnection = async (DB_URI) => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to db");
  } catch (err) {
    console.log(err);
  }
};

export default  dbConnection;