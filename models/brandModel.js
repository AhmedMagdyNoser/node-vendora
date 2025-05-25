const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, lowercase: true },
    image: String,
  },
  { timestamps: true, versionKey: false },
);

brandSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.image) obj.image = `${process.env.BASE_URL}/brands/${obj.image}`;
  return obj;
};

module.exports = mongoose.model("Brand", brandSchema);
