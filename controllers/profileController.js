const fs = require("fs");
const sharp = require("sharp");
const slugify = require("slugify");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
const ApiError = require("../utils/apiError");

// This middleware is used to process the image and create the filename to be saved in the database.
exports.processImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  const filename = `user-${slugify(req.user.name, { lower: true })}-${Date.now()}.jpeg`;
  const buffer = await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({ quality: 95 }).toBuffer();
  req.image = { buffer, filename };
  req.body.image = filename;
  next();
});

// A function to delete user image for disk.
const deleteUserImage = async (imageName) => {
  if (!imageName) return;
  try {
    await fs.promises.unlink(`uploads/users/${imageName}`);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

// =============================================================

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;
  const user = await UserModel.findByIdAndUpdate(req.user._id, { name, email, phone }, { new: true });
  if (!user) return next(new ApiError(404, "User not found."));
  res.status(200).json({ message: "User profile updated successfully.", data: user });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await UserModel.findById(req.user._id).select("+password");
  if (!user) return next(new ApiError(404, "User not found."));
  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordCorrect) return next(new ApiError(401, "Current password is incorrect."));
  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordChangedAt = Date.now();
  await user.save();
  res.status(200).json({ message: "User password updated successfully." });
});

exports.updateImage = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  if (!user) return next(new ApiError(404, "User not found."));
  await deleteUserImage(user.image);
  await sharp(req.image.buffer).toFile(`uploads/users/${req.image.filename}`);
  user.image = req.body.image;
  await user.save();
  res.status(200).json({ message: "User image updated successfully.", data: user });
});

exports.deleteImage = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  await deleteUserImage(user.image);
  user.image = undefined;
  await user.save();
  res.status(200).json({ message: "Profile image deleted successfully.", data: user });
});

exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const user = await UserModel.findById(req.user._id).select("+password");
  if (!user) return next(new ApiError(404, "User not found."));
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) return next(new ApiError(401, "Password is incorrect."));
  await deleteUserImage(user.image);
  await UserModel.findByIdAndDelete(req.user._id);
  res.status(200).json({ message: "Account deleted successfully." });
});
