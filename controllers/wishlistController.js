const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

exports.addWishlistItem = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { product } = req.body;
  if (user.wishlist.includes(product)) return next(new ApiError(409, "This product is already in your wishlist."));
  user.wishlist.push(product);
  await user.save();
  res.status(201).json({ message: "Product added to wishlist successfully.", data: user.wishlist });
});

exports.deleteWishlistItem = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { product } = req.body;
  if (user.wishlist.length === 0) return next(new ApiError(400, "Your wishlist is empty."));
  const index = user.wishlist.indexOf(product);
  if (index === -1) return next(new ApiError(404, "This product is not in your wishlist."));
  user.wishlist.splice(index, 1);
  await user.save();
  res.status(200).json({ message: "Product removed from wishlist successfully.", data: user.wishlist });
});

// Get the user's wishlist with populated product details
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = req.user;
  await user.populate("wishlist");
  res.status(200).json({ message: "Wishlist retrieved successfully.", data: user.wishlist });
});
