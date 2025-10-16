import { z } from "zod";

class AuthReqBodySchemas {
    // Login Schema
  static ValidateLogin = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  });

  // Register Schemas
  static VerifyEmail = z.object({ email: z.string().email() });

  static OTPTypeCheck = z.object({
    email: z.string().email(),
    otp: z.string().length(5, "OTP must be exactly 5 characters long"),
  });

  static RegisterComplete = z.object({
    email: z.string().email(),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().length(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
}

// Export the class
export default AuthReqBodySchemas;