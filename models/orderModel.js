const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true }, // Items total before discount and shipping
    discount: { type: Number, default: 0 }, // Discount percentage applied to the subtotal
    shippingCost: { type: Number, required: true }, // Fixed shipping cost
    totalAmount: { type: Number, required: true }, // Total after discount and shipping
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentMethod: { type: String, enum: ["cash", "card"], required: true },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    shippingAddress: { city: { type: String, required: true }, details: { type: String, required: true } }, // A subset from the addressSchema
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Order", orderSchema);
