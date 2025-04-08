const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Subcategory title is required."],
      minLength: [3, "Subcategory title must be at least 3 characters."],
      maxLength: [50, "Subcategory title must be at most 50 characters."],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      // A and B => example.com/categories/a-and-b
    },
    description: {
      type: String,
      maxLength: [250, "Subcategory description must be at most 250 characters."],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

const SubcategoryModal = mongoose.model("Subcategory", subcategorySchema);

module.exports = SubcategoryModal;
