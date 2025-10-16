class ApiResponse {
  static success(res, message, data = {}) {
    return res.status(200).json({
      status: "success",
      message,
      data,
    });
  }

  static clientError(message) {
    const err = new Error(message);
    err.status = 400;
    throw err;
  }

  static otpRateLimitError(message) {
    const err = new Error(message);
    err.status = 429;
    return err;
  }

  static serverError(err, message=null) {
    console.log(err);

    // Create a clean error object to throw
    const cleanError = new Error(message);
    cleanError.status = err.status || 500;

    throw cleanError;
  }
}
export default ApiResponse;
