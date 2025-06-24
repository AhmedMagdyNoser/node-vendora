const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");

const SHIPPING_COST = 50;

const getProductFinalPrice = (product) => product.priceAfterDiscount || product.price;

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // 1. Preparing required data and validation
  const user = req.user;
  const { address: addressId } = req.body;
  const address = user.addresses.id(addressId);
  if (!address) return next(new ApiError(404, `The address with the ID \`${addressId}\` does not exist.`));
  const shippingAddress = { city: address.city, details: address.details };

  const cartItems = JSON.parse(JSON.stringify(user.cart.items)); // A deep copy to avoid mutation
  if (cartItems.length === 0) return next(new ApiError(400, "Your cart is empty."));
  const populatedCart = await user.cart.populate(["items.product", "coupon"]);

  // 2. Preparing order items with final prices
  const orderItems = cartItems.map((item) => {
    const product = populatedCart.items.find(
      (populatedItem) => populatedItem.product._id.toString() === item.product.toString(),
    ).product;
    return {
      product: item.product, // Product ID
      quantity: item.quantity,
      price: getProductFinalPrice(product),
    };
  });

  // 3. Calculating totals
  const totalAmount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0) + SHIPPING_COST;
  const discount =
    populatedCart.coupon && populatedCart.coupon.expirationDate > Date.now() ? populatedCart.coupon.discount : 0;

  // 4. Creating the order
  const order = await OrderModel.create({
    user: user._id,
    items: orderItems,
    shippingCost: SHIPPING_COST,
    totalAmount,
    discount,
    shippingAddress,
    paymentMethod: "cash",
  });

  // 5. Populating the order with user and product details
  await order.populate([
    { path: "user", select: "name email" },
    { path: "items.product", select: "title description coverImage" },
  ]);

  // 6. Updating products quantities and sold counts
  const bulkOps = orderItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
    },
  }));

  await ProductModel.bulkWrite(bulkOps); // Sends multiple operations to the MongoDB server in one command.

  // 7. Clearing user cart
  user.cart.items = [];
  user.cart.coupon = null;
  await user.save();

  res.status(201).json({ message: "Order created successfully.", data: order });
});
