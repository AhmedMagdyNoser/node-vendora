const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    maxUsage: { type: Number, required: true },
    usageCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Coupon", couponSchema);
