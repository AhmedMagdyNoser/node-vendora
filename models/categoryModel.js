const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Category title is required."],
      minLength: [3, "Category title must be at least 3 characters."],
      maxLength: [50, "Category title must be at most 50 characters."],
    },
    slug: {
      type: String,
      lowercase: true,
      // A and B => example.com/categories/a-and-b
    },
    description: {
      type: String,
      maxLength: [250, "Category description must be at most 250 characters."],
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Category", categorySchema);
