const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    alias: { type: String, required: true },
    city: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true, versionKey: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true, select: false }, // `select: false` doesn't select the password by default in `find` queries
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, unique: true, sparse: true }, // `sparse: true` ensures the index only includes documents where phone is defined and not null. (Needed for optional unique fields)
    image: { type: String },
    addresses: [{ type: addressSchema }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: {
      items: [{ type: cartItemSchema }],
      coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    },
    security: {
      passwordResetCode: { type: String, select: false },
      passwordResetCodeExpiration: { type: Date, select: false },
    },
  },
  { timestamps: true, versionKey: false },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.image) obj.image = `${process.env.BASE_URL}/users/${obj.image}`;
  // Don't return sensitive data in the response in all cases (as `select: false` doesn't work in case of creating)
  if (obj.password) delete obj.password;
  if (obj.security) delete obj.security;
  if (obj.cart) delete obj.cart; // There are specific routes for cart
  return obj;
};

module.exports = mongoose.model("User", userSchema);
