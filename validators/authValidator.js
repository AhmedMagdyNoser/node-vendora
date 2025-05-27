const { body, cookie } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const UserModel = require("../models/userModel");

exports.registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email address.")
    .bail()
    .custom(async (email) => {
      const user = await UserModel.findOne({ email });
      if (user) throw new Error("This email is already registered.");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.",
    ),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone("ar-EG")
    .withMessage("Phone number must be a valid Egyptian phone number.")
    .bail()
    .custom(async (phone) => {
      const user = await UserModel.findOne({ phone });
      if (user) throw new Error("This phone number is already registered.");
    }),
  validatorMiddleware,
];

exports.loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("password").notEmpty().withMessage("Password is required."),
  validatorMiddleware,
];

exports.refreshAccessTokenValidator = [
  cookie("rt").notEmpty().withMessage("Refresh token is required in cookies."),
  validatorMiddleware,
];

exports.requestResetCodeValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email address."),
  validatorMiddleware,
];

exports.verifyResetCodeValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("resetCode")
    .notEmpty()
    .withMessage("Reset code is required.")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be exactly 6 digits."),
  validatorMiddleware,
];

exports.resetPasswordValidator = [
  body("resetToken").notEmpty().withMessage("Reset token is required."),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.",
    ),
  validatorMiddleware,
];
