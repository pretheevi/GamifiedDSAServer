import express from "express";
const router = express.Router();


import UserModel from "../models/User";
import ApiResponse from "../utility/apiResponse.js";
import authenticateJWT from "../middleware/authenticateJWT.js";

router.get("/getProfile", authenticateJWT, async (req, res, next) => {
  try {
    const user_id = req.userData.id;
    const data = await UserModel.getUserInfo(user_id);
    ApiResponse.success(res, "fetched Profile", data);
  } catch(err) {
    next(err);
  }
});