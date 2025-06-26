const asyncHandler = require("express-async-handler");
const factory = require("../utils/factory");
const ApiError = require("../utils/apiError");
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");

const SHIPPING_COST = 50;

const orderPopulation = [
  { path: "user", select: "name email" },
  { path: "items.product", select: "title description coverImage" },
];

const getProductFinalPrice = (product) => product.priceAfterDiscount || product.price;

// =============================================================

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
  const populatedCoupon = populatedCart.coupon;

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
  const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = populatedCoupon && populatedCoupon.expirationDate > Date.now() ? populatedCoupon.discount : 0;
  const subtotalAfterDiscount = discount ? subtotal - (subtotal * discount) / 100 : subtotal;
  const totalAmount = subtotalAfterDiscount + SHIPPING_COST;

  // 4. Creating the order
  const order = await OrderModel.create({
    user: user._id,
    items: orderItems,
    subtotal,
    discount,
    shippingCost: SHIPPING_COST,
    totalAmount,
    paymentMethod: "cash",
    shippingAddress,
  });

  // 5. Populating the order with user and product details
  await order.populate(orderPopulation);

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

exports.getOrders = [
  // Middleware to filter orders based on user role
  asyncHandler(async (req, res, next) => {
    if (req.user.role === "user") req.query.user = req.user._id;
    next();
  }),
  factory.getAllDocuments(OrderModel, { populate: orderPopulation }),
];

exports.getOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let order = await OrderModel.findById(id).populate(orderPopulation);
  if (!order || (req.user.role === "user" && order.user._id !== req.user._id))
    return next(new ApiError(404, `Order with ID: \`${id}\` does not exist.`));
  res.status(200).json({ message: "Order retrieved successfully.", data: order });
});

exports.setAsPaid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await OrderModel.findByIdAndUpdate(id, { isPaid: true, paidAt: Date.now() }, { new: true }).populate(
    orderPopulation,
  );
  if (!order) return next(new ApiError(404, `Order with ID: \`${id}\` does not exist.`));
  res.status(200).json({ message: "Order marked as paid successfully.", data: order });
});

exports.setAsDelivered = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await OrderModel.findByIdAndUpdate(
    id,
    { isDelivered: true, deliveredAt: Date.now() },
    { new: true },
  ).populate(orderPopulation);
  if (!order) return next(new ApiError(404, `Order with ID: \`${id}\` does not exist.`));
  res.status(200).json({ message: "Order marked as delivered successfully.", data: order });
});
