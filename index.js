// Access to env file
import dotenv from "dotenv";
dotenv.config();

// Get PORT number
const PORT = process.env.PORT;

// Importing required modules
import http from "http";
import express from "express";
import cors from 'cors';

// Importing global error handler middleware
import globalErrorHandler from "./middleware/errorHandler.js";

// Importing centralized Api
import apiRouter from "./routes/index.js";

const app = express();
const server = http.createServer(app);

// Database Startup
import UserModel from "./models/User.js";
import ProblemModel from "./models/Problem.js";
import UserProblemProgressModel from "./models/UserProblemProgress.js";
import OTPModel from "./models/Otp.js";
UserModel.initTable();
ProblemModel.createProblemTable();
UserProblemProgressModel.createUserProblemProgressTable();
OTPModel.initTable();

// configure cors connection
app.use(cors({
  origin: "https://gamifieddsaclient.onrender.com",
  methods: ["GET", "POST", "UPDATE", "DELETE"],
  credentials: true,
}));

// middleware to convert request body json object into javascript object
app.use(express.json());
// middleware to check the incoming request Method and Path
app.use((req, res, next) => {
  console.log(`${req.method}: Path ${req.path}`);
  next();
});

// Centralized API for all incoming request
app.use("/api", apiRouter);
// Centralized Error middleware
app.use(globalErrorHandler);

// Server Starts
server.listen(PORT, "0.0.0.0", () => {
  console.log("listening on PORT:", PORT);
});
