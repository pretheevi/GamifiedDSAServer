import express from "express";
const router = express.Router();

import ProblemModel from "../models/Problem.js";
import ApiResponse from "../utility/apiResponse.js";
import authenticateJWT from "../middleware/authenticateJWT.js";
import UserModel from "../models/User.js";
import UserProblemProgressModel from "../models/UserProblemProgress.js";
router.get("/getAllProblems", authenticateJWT, async (req, res, next) => {
  try {
    const user_id = req.userData.id;
    const data = await ProblemModel.getAllProblem(user_id);
    ApiResponse.success(res, "fetched all problem data", data);
  } catch (err) {
    next(err);
  }
});

router.get("/getProfile", authenticateJWT, async (req, res, next) => {
  try {
    const user_id = req.userData.id;
    const data = await UserModel.getUserInfo(user_id);
    ApiResponse.success(res, "fetched Profile", data);
  } catch(err) {
    next(err);
  }
});

router.post("/updateStatusTime", authenticateJWT, async (req, res, next) => {
  try {
    const user_id = req.userData.id;
    const { problem_id, status, time_spent } = req.body;
    console.log({ user_id, problem_id, status, time_spent });
    const data = await UserProblemProgressModel.updateUserProblemProgress(user_id, problem_id, status, time_spent);
    ApiResponse.success(res, "updated status and time spent", data);
  } catch(err) {
    next(err);
  }
});

router.post("/problemStatusSolved", authenticateJWT, async (req, res, next) => {
  try {
    const user_id = req.userData.id;
    const { problem_id, status } = req.body; // Changed from req.query
    
    const data = await UserProblemProgressModel.updateProblemStatusSolved(
      user_id, problem_id, status
    );
    
    ApiResponse.success(res, "Problem status updated successfully", data);
  } catch(err) {
    next(err);
  }
});




export default router;
