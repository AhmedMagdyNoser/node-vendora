const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const UserModal = require("../../models/userModel");

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required.")
    .isLength({ min: 3 })
    .withMessage("User name must be at least 3 characters long.")
    .isLength({ max: 32 })
    .withMessage("User name must be at most 32 characters long.")
    .trim(),
  check("email")
    .notEmpty()
    .withMessage("User email is required.")
    .isEmail()
    .withMessage("User email must be a valid email address.")
    .trim()
    .custom(async (email) => {
      const user = await UserModal.findOne({ email });
      if (user) throw new Error("User with this email already exists.");
    }),
  check("password")
    .notEmpty()
    .withMessage("User password is required.")
    .isLength({ min: 8 })
    .withMessage("User password must be at least 8 characters long."),
  check("role").optional().isIn(["user", "admin"]).withMessage("User role must be either 'user' or 'admin'."),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("User phone must be a valid Egyptian phone number.")
    .custom(async (phone) => {
      const user = await UserModal.findOne({ phone });
      if (user) throw new Error("User with this phone already exists.");
    }),
  check("image").optional().isString().withMessage("User image must be a valid image url."),
  validatorMiddleware,
];

exports.getUserValidator = [check("id").isMongoId().withMessage("Invalid user id format."), validatorMiddleware];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format."),
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("User name must be at least 3 characters long.")
    .isLength({ max: 32 })
    .withMessage("User name must be at most 32 characters long.")
    .trim(),
  check("email")
    .optional()
    .isEmail()
    .withMessage("User email must be a valid email address.")
    .trim()
    .custom(async (email, { req }) => {
      const user = await UserModal.findOne({ email, _id: { $ne: req.params.id } }); // $ne: not equal (except the current user)
      if (user) throw new Error("User with this email already exists.");
    }),
  check("password").optional().isLength({ min: 8 }).withMessage("User password must be at least 8 characters long."),
  check("role").optional().isIn(["user", "admin"]).withMessage("User role must be either 'user' or 'admin'."),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("User phone must be a valid Egyptian phone number.")
    .custom(async (phone, { req }) => {
      const user = await UserModal.findOne({ phone, _id: { $ne: req.params.id } }); // $ne: not equal (except the current user)
      if (user) throw new Error("User with this phone already exists.");
    }),
  check("image").optional().isString().withMessage("User image must be a valid image url."),
  validatorMiddleware,
];

exports.deleteUserValidator = [check("id").isMongoId().withMessage("Invalid user id format."), validatorMiddleware];
