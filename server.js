import express from "express";
import dotenv from "dotenv";
import dbConnection from "./db/dbConnection.js";
import userRouter from "./Routes/userRouter.js";
import cookieParser from "cookie-parser";
import postRouter from "./Routes/postRouter.js";
dotenv.config();
const PORT = process.env.PORT;
const app = express();

// Using global Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// Connecting To DB
dbConnection(process.env.DB_URI);

// Load Routes
app.use("/api/v1/user",userRouter);
app.use("/api/v1/post",postRouter);

app.listen(PORT,(req,res)=>{
    // console.log(req.ip);
    console.log(`Connected to the ${PORT}`);
});