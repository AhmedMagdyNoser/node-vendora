const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const UserModel = require("../models/userModel");

exports.addWishlistItem = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { productId } = req.body;
  if (user.wishlist.includes(productId)) return next(new ApiError(400, "This product is already in your wishlist."));
  user.wishlist.push(productId);
  await user.save();
  res.status(201).json({ message: "Product added to wishlist successfully.", data: user.wishlist });
});

exports.deleteWishlistItem = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { productId } = req.body;
  if (user.wishlist.length === 0) return next(new ApiError(400, "Your wishlist is empty."));
  const index = user.wishlist.indexOf(productId);
  if (index === -1) return next(new ApiError(400, "This product is not in your wishlist."));
  user.wishlist.splice(index, 1);
  await user.save();
  res.status(200).json({ message: "Product removed from wishlist successfully.", data: user.wishlist });
});

// Get the user's wishlist with populated product details
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate("wishlist");
  if (!user) return next(new ApiError(404, "This user does not exist."));
  res.status(200).json({ data: user.wishlist });
});
