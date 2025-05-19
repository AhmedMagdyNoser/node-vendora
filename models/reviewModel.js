const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    title: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Review", reviewSchema);
