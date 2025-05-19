const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true, select: false }, // (select: false): don't return the password in the response
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, unique: true, sparse: true }, // (sparse: true): ensures the index only includes documents where phone is defined and not null. (Needed for optional unique fields)
    image: { type: String },
    // --- Security ---
    passwordResetCode: String,
    passwordResetCodeExpiration: Date,
    passwordResetCodeVerified: Boolean,
    passwordChangedAt: Date,
  },
  { timestamps: true, versionKey: false },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.image) obj.image = `${process.env.BASE_URL}/users/${obj.image}`;
  if (obj.password) delete obj.password; // (delete obj.password): don't return the password in the response (i. e. in case of creating)
  return obj;
};

module.exports = mongoose.model("User", userSchema);
