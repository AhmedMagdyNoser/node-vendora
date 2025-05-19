const { param, body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const UserModel = require("../models/userModel");

exports.createUserValidator = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email address.")
    .bail()
    .custom(async (email) => {
      const user = await UserModel.findOne({ email });
      if (user) throw new Error("User with this email already exists.");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.",
    ),
  body("role").optional().isIn(["user", "admin"]).withMessage("Role must be either 'user' or 'admin'."),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone("ar-EG")
    .withMessage("Phone number must be a valid Egyptian phone number.")
    .bail()
    .custom(async (phone) => {
      const user = await UserModel.findOne({ phone });
      if (user) throw new Error("User with this phone already exists.");
    }),
  body("image").optional().trim().notEmpty().withMessage("Image cannot be empty string."),
  validatorMiddleware,
];

exports.getUserValidator = [param("id").isMongoId().withMessage("Invalid user ID format."), validatorMiddleware];

exports.updateUserValidator = [
  param("id").isMongoId().withMessage("Invalid user ID format."),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty string."),
  body("email")
    .optional()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email address.")
    .bail()
    .custom(async (email, { req }) => {
      const user = await UserModel.findOne({ email, _id: { $ne: req.params.id } }); // $ne: not equal (exclude this user)
      if (user) throw new Error("User with this email already exists.");
    }),
  body("password")
    .optional()
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.",
    ),
  body("role").optional().isIn(["user", "admin"]).withMessage("User role must be either 'user' or 'admin'."),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone("ar-EG")
    .withMessage("Phone number must be a valid Egyptian phone number.")
    .bail()
    .custom(async (phone, { req }) => {
      const user = await UserModel.findOne({ phone, _id: { $ne: req.params.id } }); // $ne: not equal (exclude this user)
      if (user) throw new Error("User with this phone already exists.");
    }),
  body("image").optional().trim().notEmpty().withMessage("Image cannot be empty string."),
  validatorMiddleware,
];

exports.deleteUserValidator = [param("id").isMongoId().withMessage("Invalid user ID format."), validatorMiddleware];
