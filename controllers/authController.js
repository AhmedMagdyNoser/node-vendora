const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/mailer");

const generateAccessToken = (_id) =>
  jwt.sign({ _id }, process.env.JWT_SECRET_KEY, { expiresIn: `${process.env.JWT_AT_EXPIRATION_TIME}s` });

const generateRefreshToken = (_id) =>
  jwt.sign({ _id }, process.env.JWT_SECRET_KEY, { expiresIn: `${process.env.JWT_RT_EXPIRATION_TIME}s` });

const createHash = (string) => crypto.createHash("sha256").update(string).digest("hex");

const cookiesOptions = { httpOnly: true, maxAge: process.env.JWT_RT_EXPIRATION_TIME * 1000, sameSite: "none", secure: true }; // `maxAge` is the expiration time of the refresh token in the client in MILLISECONDS.

// =============================================================

exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await UserModel.create({ name, email, phone, password: hashedPassword });
  const rt = generateRefreshToken(user._id);
  res.cookie("rt", rt, cookiesOptions);
  const at = generateAccessToken(user._id);
  res.status(201).json({ data: user, at });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) return next(new ApiError(401, "Invalid Credintials."));
  const rt = generateRefreshToken(user._id);
  res.cookie("rt", rt, cookiesOptions);
  const at = generateAccessToken(user._id);
  res.status(200).json({ data: user, at });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("rt");
  res.sendStatus(204);
});

exports.refreshAccessToken = asyncHandler(async (req, res, next) => {
  jwt.verify(req.cookies.rt, process.env.JWT_SECRET_KEY, async (err, decoded) => {
    if (err) return next(new ApiError(401, "Invalid refresh token. Please login again."));
    else {
      const user = await UserModel.findById(decoded._id);
      if (!user) return next(new ApiError(401, "User not found."));
      const at = generateAccessToken(user._id);
      res.status(200).json({ data: user, at });
    }
  });
});

exports.requestResetCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return next(new ApiError(404, "We couldn't find an account with that email address."));
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.security.passwordResetCode = createHash(resetCode);
  user.security.passwordResetCodeExpiration = Date.now() + 10 * 60 * 1000; // 10 Minutes
  await user.save();
  await sendEmail(
    email,
    "Password Reset Code",
    `
      <h1>Password Reset Request</h1>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. Your reset code is:</p>
      <h2 style="color: #358538; font-size: 24px; text-align: center; padding: 10px; background: #f5f5f5; border-radius: 5px;">${resetCode}</h2>
      <p>This code will expire in 10 minutes for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards, <br>Vendora</p>
    `,
  );
  res.status(200).json({ message: "Reset code has been sent to your email. Please check your inbox." });
});

exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  const { email, resetCode } = req.body;
  const user = await UserModel.findOne({ email }).select(
    "+security.passwordResetCode +security.passwordResetCodeExpiration",
  );
  if (!user) return next(new ApiError(404, "We couldn't find an account with that email address."));
  if (!user.security.passwordResetCode || !user.security.passwordResetCodeExpiration)
    return next(new ApiError(400, "No password reset request was made. Please request a reset code first."));
  if (Date.now() > user.security.passwordResetCodeExpiration)
    return next(new ApiError(400, "The reset code has expired. Please request a new one."));
  if (createHash(resetCode) !== user.security.passwordResetCode)
    return next(new ApiError(400, "Invalid reset code. Please check the code and try again."));
  await user.save();
  res.status(200).json({
    message: "Reset code verified successfully. You can now set your new password.",
    resetToken: generateAccessToken(user._id),
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken, password } = req.body;
  jwt.verify(resetToken, process.env.JWT_SECRET_KEY, async (err, decoded) => {
    if (err) return next(new ApiError(401, "Invalid reset token. Please request a new one."));
    else {
      const user = await UserModel.findById(decoded._id);
      if (!user) return next(new ApiError(404, "User not found."));
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.security.passwordResetCode = undefined;
      user.security.passwordResetCodeExpiration = undefined;
      await user.save();
      res.status(200).json({ message: "Your password has been reset successfully. You can login with your new password." });
    }
  });
});
