// This class is created for better organization of error handling.
class ApiError extends Error {
  constructor(statusCode, message) {
    super();
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ApiError;
