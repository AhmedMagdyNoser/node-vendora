const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required."] },
    email: { type: String, required: [true, "Email is required."], lowercase: true, unique: true },
    password: { type: String, required: [true, "Password is required."], select: false }, // (select: false): don't return the password in the response
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, unique: true },
    image: { type: String },
  },
  { timestamps: true, versionKey: false },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.image) obj.image = `${process.env.BASE_URL}/users/${obj.image}`;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
