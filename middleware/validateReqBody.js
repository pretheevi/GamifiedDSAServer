import AuthReqBodySchemas from "../schemas/authSchemas.js";

class ReqBodyValidation {
  // Middleware to validate login request body
  static Login = (req, res, next) => {
    try {
      const data = AuthReqBodySchemas.ValidateLogin.parse(req.body);
      req.validatedBody = data;
      next();
    } catch (err) {
      next(err);
    }
  };

  // Middleware to validate registration start request body
  static RegisterStart = (req, res, next) => {
    try {
      const data = AuthReqBodySchemas.VerifyEmail.parse(req.body);
      req.validatedBody = data;
      next();
    } catch (err) {
      next(err);
    }
  };

  // Middleware to validate OTP verification request body
  static OtpVerify = (req, res, next) => {
    try {
      const data = AuthReqBodySchemas.OTPTypeCheck.parse(req.body);
      req.validatedBody = data;
      next();
    } catch (err) {
      next(err);
    }
  };

  static RegisterComplete = (req, res, next) => {
    try {
      const data = AuthReqBodySchemas.RegisterComplete.parse(req.body);
      req.validatedBody = data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export default ReqBodyValidation;
