const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true, select: false }, // `select: false` doesn't select the password by default in `find` queries
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, unique: true, sparse: true }, // `sparse: true` ensures the index only includes documents where phone is defined and not null. (Needed for optional unique fields)
    image: { type: String },
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
  if (obj.password) delete obj.password; // Don't return the password in the response in all cases (as `select: false` doesn't work in case of creating)
  if (obj.security) delete obj.security;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
