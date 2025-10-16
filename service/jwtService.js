import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import ApiResponse from "../utility/apiResponse.js";


class JWT {
  static signToken(id, email) {
    const payload = { id, email };
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      ApiResponse.clientError("Invalid/Expired token")
    }
  }
}

export default JWT;
