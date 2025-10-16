import express from "express";
const router = express.Router();

//  Importing express-rate-limit to limit the number of requests to the OTP verification endpoint
import rateLimit from "express-rate-limit";

// middlewares
// Importing custom ReqBodyValidation middleware to validate request body json object schemas for each authentication route
import ReqBodyValidation from "../middleware/validateReqBody.js";
// Importing custom authenticateJWT middleware to authenticate jwt token in protected routes
import authenticateJWT from "../middleware/authenticateJWT.js";

//  Importing custom OTP Model to handle OTP table related database operations
import OTPModel from "../models/Otp.js";

// Importing custom OTP Service to handle OTP generate and send to email
import OtpService from "../service/OtpService.js";

// Importing custom ApiResponse to handle API responses in a consistent format
import ApiResponse from "../utility/apiResponse.js";

// Importing custom User Model to handle user table related database operations
import UserModel from "../models/User.js";

// Importing custom JWT to handle jwt generate and verify operations
import JWT from "../service/jwtService.js";


// Login router
router.post("/login", ReqBodyValidation.Login, async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    // Using UserModel to Login the user
    const user = await UserModel.authenticateUser(email, password);

    // Create JWT
    const token = JWT.signToken(user.id, user.email);

    // Using ApiResponse to send a success response
    ApiResponse.success(res, "Login successful", { token });
  } catch (err) {
    // Throwing error to the next GlobalErrorHandler middleware
    next(err);
  }
});

// Three step registration process
// 1. Start registration by getting email to send OTP to that email.
router.post("/registerStart", ReqBodyValidation.RegisterStart, async (req, res, next) => {
    try {
      const data = req.validatedBody;
      // Using OtpService to send OTP to the user's email
      const sended = await OtpService.createAndSendOtp(data.email);

      // Using ApiResponse to send a success response
      ApiResponse.success(res, "OTP sent successfully", sended);
    } catch (err) {
      // Throwing error to the next GlobalErrorHandler middleware
      next(err);
    }
  }
);

// Create a rate limiter for OTP verification
// This will limit the number of OTP verification attempts to 5 per IP address every 5 minutes
const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,                 // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    const err = ApiResponse.otpRateLimitError("Too many OTP attempts, please try again later."); // Custom new error message if rate limit is exceeded
    next(err);       
  },
});

// 2. Verify the OTP given by user that was sent to the user's email in the previous registerStart step.
router.post("/otpVerify", otpRateLimiter, ReqBodyValidation.OtpVerify, async (req, res, next) => {
    try {
      const data = req.validatedBody;

      // Using OTPModel to verify the OTP
      const result = await OTPModel.verifyOtpForEmail(data.email, data.otp);

      // Using ApiResponse to send a success response
      ApiResponse.success(res, "OTP Verified", result);
    } catch (err) {
      // Throwing error to the next GlobalErrorHandler middleware
      next(err);
    }
  }
);

// 3. Complete the registration by saving the new user after OTP verification.
router.post("/registerComplete", ReqBodyValidation.RegisterComplete, async (req, res, next) => {
    try {
      const data = req.validatedBody;

      // Using UserModel to save the new user after OTP verification
      const savedUser = await UserModel.registerUser(
        data.username,
        data.email,
        data.password
      );

      // Using ApiResponse to send a success response
      ApiResponse.success(res, "Registration complete", savedUser);
    } catch (err) {
      // Throwing error to the next GlobalErrorHandler middleware
      next(err);
    }
  }
);

router.get("/test", authenticateJWT, (req, res, next) => {
  try {
    const user = req.userData;
    ApiResponse.success(res, "authenticate jwt is working 🤓", user);
  } catch (err) {
    // Throwing error to the next GlobalErrorHandler middleware
    next(err);
  }
});

export default router;
