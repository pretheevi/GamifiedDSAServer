import { ZodError } from "zod";

export default function globalErrorHandler(err, req, res, next) {
  console.error("Global Error Handler:", err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      message: err.issues[0]?.message || "Validation error",
    });
  }

  // Handle known custom errors
  if (err.status && err.status !== 500) {
    return res.status(err.status).json({
      status: "error",
      message: err.message,
    });
  }

  // Fallback for unexpected errors
  res.status(500).json({
    status: "error",
    message: process.env.NODE_ENV === "development"
      ? err.message || "Internal Server Error"
      : "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
