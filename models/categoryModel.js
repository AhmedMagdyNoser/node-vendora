const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, lowercase: true }, // A and B => example.com/categories/a-and-b
    description: String,
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Category", categorySchema);
