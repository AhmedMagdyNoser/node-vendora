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
    shippingCost: { type: Number, required: true },
    totalAmount: { type: Number, required: true }, // Items totals + shipping cost (without calculating discount)
    discount: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentMethod: { type: String, enum: ["cash", "card"], required: true },
    shippingAddress: { city: { type: String, required: true }, details: { type: String, required: true } }, // A subset from the addressSchema
    status: { type: String, enum: ["pending", "shipped", "delivered"], default: "pending" },
    deliveredAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Order", orderSchema);
