const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const factory = require("../utils/factory");
const ApiError = require("../utils/apiError");
const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const UserModel = require("../models/userModel");

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

exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
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

  // 4. Creating the Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    // We can use the `line_items` to specify the products and their prices, but here we are using a single line item for the order
    line_items: [
      {
        quantity: 1, // Since we are creating a single session for the entire order
        price_data: {
          product_data: { name: "Order Items" },
          unit_amount: subtotalAfterDiscount * 100, // Stripe expects the amount in cents
          currency: "usd",
        },
      },
    ],

    mode: "payment", // Mode of the session, can be 'payment', 'subscription', etc.
    payment_method_types: ["card"], // Optional: Limit payment methods to cards
    success_url: `${req.protocol}://${req.get("host")}/payment-success`, // The URL to redirect to after successful payment
    cancel_url: `${req.protocol}://${req.get("host")}/payment-cancel`, // The URL to redirect to after payment cancellation
    client_reference_id: user._id.toString(), // Optional: Store the user ID for reference
    customer_email: user.email, // Optional: pre-fill the customer's email
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: `Shipping to ${shippingAddress.city}`,
          fixed_amount: { amount: SHIPPING_COST * 100, currency: "usd" },
          type: "fixed_amount",
        },
      },
    ],

    // Metadata to store additional information about the order
    metadata: {
      user: user._id.toString(),
      items: JSON.stringify(orderItems),
      subtotal,
      discount,
      shippingCost: SHIPPING_COST,
      totalAmount,
      shippingAddress: JSON.stringify(shippingAddress),
    },
  });

  // This endpoint returns a Stripe session object containing a URL to redirect the user for payment.

  // Use the following test card numbers to simulate various payment scenarios:
  // - Successful payment: 4242 4242 4242 4242
  // - Payment that requires authentication: 4000 0025 0000 3155
  // - Declined payment: 4000 0000 0000 9995

  // Once the payment is completed, the order can be created in the database using the `checkout.session.completed` event from the Stripe webhook.

  res.status(200).json({ message: "Checkout session created successfully.", data: session });
});

exports.createCardOrder = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET_KEY);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  // Our logic to create an order after a successful payment
  if (event.type === "checkout.session.completed") {
    // 1. Create a new order in the database
    const metadata = event.data.object.metadata;
    const order = await OrderModel.create({
      user: metadata.user,
      items: JSON.parse(metadata.items),
      subtotal: metadata.subtotal,
      discount: metadata.discount,
      shippingCost: metadata.shippingCost,
      totalAmount: metadata.totalAmount,
      paymentMethod: "card",
      shippingAddress: JSON.parse(metadata.shippingAddress),
      isPaid: true, // Since this is a card order, we assume it's paid immediately
      paidAt: Date.now(),
    });

    // 2. Populating the order with user and product details
    await order.populate(orderPopulation);

    // 3. Updating products quantities and sold counts
    const bulkOps = JSON.parse(metadata.items).map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }));

    await ProductModel.bulkWrite(bulkOps); // Sends multiple operations to the MongoDB server in one command.

    // 4. Clearing user cart
    await UserModel.findByIdAndUpdate(metadata.user, { cart: { items: [], coupon: null } });

    res.status(201).json({ message: "Order created successfully.", data: order });
  } else {
    return res.status(400).json({ message: `Unhandled event type: ${event.type}` });
  }
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
