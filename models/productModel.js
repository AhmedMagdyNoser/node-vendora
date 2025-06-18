const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceAfterDiscount: Number,
    coverImage: { type: String, required: true },
    images: { type: [String], default: [] },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
    quantity: { type: Number, required: true },
    sold: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 5 },
    ratingsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    // To Enable Virtuals
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Add a virtual field `reviews`
productSchema.virtual("reviews", {
  localField: "_id",
  ref: "Review",
  foreignField: "product",
  options: { populate: { path: "user", select: "name" } },
});

productSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.coverImage) obj.coverImage = `${process.env.BASE_URL}/products/${obj.coverImage}`;
  if (obj.images) obj.images = obj.images.map((image) => `${process.env.BASE_URL}/products/${image}`);
  return obj;
};

module.exports = mongoose.model("Product", productSchema);
