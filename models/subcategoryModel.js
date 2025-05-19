const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, lowercase: true }, // A and B => example.com/categories/a-and-b
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Subcategory", subcategorySchema);
