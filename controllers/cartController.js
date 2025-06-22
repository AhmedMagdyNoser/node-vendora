const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ProductModel = require("../models/productModel");
const CouponModel = require("../models/couponModel");

const cartPopulation = [
  { path: "cart.items.product", select: "title description coverImage price priceAfterDiscount" },
  { path: "cart.coupon", select: "code discount" },
];

const couponHasExpired = (coupon) => coupon.expirationDate < Date.now();
const couponHasReachedMaxUsage = (coupon) => coupon.maxUsage <= coupon.usageCount;

// =============================================================

exports.addCartItem = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { product: productId, quantity } = req.body;
  // Check if similar item is already in the cart
  if (user.cart.items.find((item) => item.product.toString() === productId))
    // If the product has additional options (e.g., color), you should compare them here as well to ensure it's the exact variant.
    return next(new ApiError(409, "This item is already in your cart."));
  const product = await ProductModel.findById(productId);
  if (!product) return next(new ApiError(404, `The product with the ID \`${productId}\` does not exist.`));
  if (product.quantity < quantity) return next(new ApiError(400, `No enough quantity for the product \`${productId}\`.`));
  user.cart.items.push({ product: productId, quantity });
  await user.save();
  await user.populate(cartPopulation);
  res.status(201).json({ message: "Item added to cart successfully.", data: user.cart });
});

exports.getCart = asyncHandler(async (req, res) => {
  const user = req.user;
  // Revalidate the applied coupon
  if (user.cart.coupon) {
    const coupon = await CouponModel.findById(user.cart.coupon);
    if (!coupon || couponHasExpired(coupon)) {
      user.cart.coupon = null;
      await user.save();
      if (coupon) {
        coupon.usageCount = coupon.usageCount - 1;
        await coupon.save();
      }
    }
  }
  await user.populate(cartPopulation);
  res.status(200).json({ message: "Cart retrieved successfully.", data: user.cart });
});

exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { quantity } = req.body;
  if (user.cart.items.length === 0) return next(new ApiError(400, "Your cart is empty."));
  const item = req.user.cart.items.id(id);
  if (!item) return next(new ApiError(404, `The cart item with the ID \`${id}\` does not exist.`));
  const productId = item.product;
  const product = await ProductModel.findById(productId);
  if (!product) return next(new ApiError(404, `The product with the ID \`${productId}\` does not exist.`));
  if (product.quantity < quantity) return next(new ApiError(400, `No enough quantity for the product \`${productId}\`.`));
  item.quantity = quantity;
  await user.save();
  await user.populate(cartPopulation);
  res.status(200).json({ message: "Item quantity updated successfully.", data: user.cart });
});

exports.deleteCartItem = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  if (user.cart.items.length === 0) return next(new ApiError(400, "Your cart is empty."));
  const item = req.user.cart.items.id(id);
  if (!item) return next(new ApiError(404, `The cart item with the ID \`${id}\` does not exist.`));
  item.deleteOne();
  await user.save();
  await user.populate(cartPopulation);
  res.status(200).json({ message: "Item removed from cart successfully.", data: user.cart });
});

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { code } = req.body;
  if (user.cart.items.length === 0) return next(new ApiError(400, "Your cart is empty."));
  if (user.cart.coupon) return next(new ApiError(400, "You have already applied a coupon to your cart."));
  const coupon = await CouponModel.findOne({ code });
  if (!coupon) return next(new ApiError(404, `The coupon \`${code}\` does not exist.`));
  if (couponHasExpired(coupon)) return next(new ApiError(400, "This coupon has expired."));
  if (couponHasReachedMaxUsage(coupon)) return next(new ApiError(400, "This coupon has reached its maximum usage limit."));
  coupon.usageCount = coupon.usageCount + 1;
  await coupon.save();
  user.cart.coupon = coupon._id;
  await user.save();
  await user.populate(cartPopulation);
  res.status(200).json({ message: "Coupon applied successfully.", data: user.cart });
});

exports.revokeCoupon = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user.cart.coupon) return next(new ApiError(400, "There is no coupon applied to your cart"));
  const coupon = await CouponModel.findById(user.cart.coupon);
  coupon.usageCount = coupon.usageCount - 1;
  await coupon.save();
  user.cart.coupon = null;
  await user.save();
  await user.populate(cartPopulation);
  res.status(200).json({ message: "Coupon applied successfully.", data: user.cart });
});
