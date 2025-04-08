const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Product title is required."] },
    slug: { type: String, lowercase: true },
    description: {
      type: String,
      required: [true, "Product description is required."],
    },
    price: {
      type: Number,
      required: [true, "Product price is required."],
      min: [1, "Product price must be at least 1."],
      max: [9999, "Product price must be at most 9999."],
    },
    priceAfterDiscount: {
      type: Number,
      min: [1, "Product price must be at least 1."],
      max: [9999, "Product price must be at most 9999."],
    },
    coverImage: String,
    images: [String],
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required."],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: [true, "Product subcategory is required."],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required."],
    },
    sold: { type: Number, default: 0 },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating must be at most 5."],
    },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Product", productSchema);
