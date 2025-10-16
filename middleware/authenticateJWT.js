import ApiResponse from "../utility/apiResponse.js";
import JWT from "../service/jwtService.js";

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ApiResponse.clientError("No token provided");
  }

  const token = authHeader.split(" ")[1];
  const decoded = JWT.verifyToken(token);

  req.userData = decoded;
  next();
};

export default authenticateJWT;