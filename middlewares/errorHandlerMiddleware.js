const { isDevelopmentMode } = require("../utils/helpers");

// Global error handler middleware — recognized by Express through its FOUR parameters
module.exports = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    statusCode: err.statusCode || 500,
    message: err.message,
    ...(isDevelopmentMode ? { stack: err.stack } : {}),
  });
};
