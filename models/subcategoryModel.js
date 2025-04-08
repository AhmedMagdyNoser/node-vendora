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

// // Mongoose middleware to populate the category field before executing any `find` query (like find, findOne, findAndUpdate, etc.)
// subcategorySchema.pre(/^find/, function (next) {
//   this.populate("category"); // `this` refers to the current query
//   next();
// });

module.exports = mongoose.model("Subcategory", subcategorySchema);
