const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, lowercase: true },
    image: String,
  },
  { timestamps: true, versionKey: false },
);

// Transform the image field to include the full URL whenever the document is converted to JSON (which happens when sending the response).
brandSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.image) obj.image = `${process.env.BASE_URL}/brands/${obj.image}`;
  return obj;
};

module.exports = mongoose.model("Brand", brandSchema);
