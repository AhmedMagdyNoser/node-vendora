const { body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const UserModel = require("../models/userModel");

exports.updateProfileValidator = [
  body("name").optional().trim().notEmpty().withMessage("User name cannot be empty string."),
  body("email")
    .optional()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email address.")
    .bail()
    .custom(async (email, { req }) => {
      const user = await UserModel.findOne({ email, _id: { $ne: req.user._id } });
      if (user) throw new Error("User with this email already exists.");
    }),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone("ar-EG")
    .withMessage("Phone number must be a valid Egyptian phone number.")
    .bail()
    .custom(async (phone, { req }) => {
      const user = await UserModel.findOne({ phone, _id: { $ne: req.user._id } });
      if (user) throw new Error("User with this phone already exists.");
    }),
  validatorMiddleware,
];

exports.updatePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required."),
  body("newPassword")
    .notEmpty()
    .withMessage("New Password is required.")
    .bail()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.",
    ),
  validatorMiddleware,
];

exports.updateImageValidator = [body("image").trim().notEmpty().withMessage("Image is required."), validatorMiddleware];

exports.deleteAccountValidator = [body("password").notEmpty().withMessage("Password is required."), validatorMiddleware];
