const { param, body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.createBrandValidator = [
  body("name").trim().notEmpty().withMessage("Brand name is required."),
  body("image")
    .optional() // Ignore validation if the field is `undefined`.
    .trim()
    .notEmpty()
    .withMessage("Brand image cannot be empty string."),
  validatorMiddleware,
];

exports.getBrandValidator = [param("id").isMongoId().withMessage("Invalid brand ID format."), validatorMiddleware];

exports.updateBrandValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format."),
  body("name")
    .optional() // Ignore validation if the field is `undefined`.
    .trim()
    .notEmpty()
    .withMessage("Brand name cannot be empty string."),
  body("image")
    .optional() // Ignore validation if the field is `undefined`.
    .trim()
    .notEmpty()
    .withMessage("Brand image cannot be empty string."),
  validatorMiddleware,
];

exports.deleteBrandValidator = [param("id").isMongoId().withMessage("Invalid brand ID format."), validatorMiddleware];
