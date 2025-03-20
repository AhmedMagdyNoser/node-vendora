const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Brand name is required."] },
    slug: { type: String, lowercase: true },
    image: String,
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Brand", brandSchema);
