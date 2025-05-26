const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
const ApiError = require("../utils/apiError");

exports.authenticate = asyncHandler(async (req, res, next) => {
  // 1. Get the token.
  let token;
  const authObj = req.headers.authorization;
  if (authObj && authObj.startsWith("Bearer")) token = authObj.split(" ")[1];
  if (!token) return next(new ApiError(401, "Please login to access this route."));
  // 2. Verify and decode the JWT using the secret key.
  // If the token is valid, this returns the decoded payload { _id: '681aa26e08b75c10d0a32c57', iat: ..., exp: ... }.
  // This will throw an error in the following cases: A. Secret key is invalid. B. Token is invalid. C. Token has expired.
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3. Check if user exists.
  const user = await UserModel.findById(decoded._id);
  if (!user) return next(new ApiError(401, "User belonging to this token no longer exists."));

  req.user = user;
  next();
});

exports.allowTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // Check if the user roles is in the allowed roles list
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "You're not authorized to access this route."));
    next();
  });
