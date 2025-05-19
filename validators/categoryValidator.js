const { param, body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.createCategoryValidator = [
  body("title").trim().notEmpty().withMessage("Category title is required."),
  body("description")
    .optional() // Ignore validation if the field is `undefined`.
    .trim()
    .notEmpty()
    .withMessage("Category description cannot be empty string."),
  validatorMiddleware,
];

exports.getCategoryValidator = [param("id").isMongoId().withMessage("Invalid category ID format."), validatorMiddleware];

exports.updateCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid category ID format."),
  body("title")
    .optional() // Ignore validation if the field is `undefined`.
    .trim()
    .notEmpty()
    .withMessage("Category title is required."),
  body("description")
    .optional() // Ignore validation if the field is `undefined`.
    .trim()
    .notEmpty()
    .withMessage("Category description cannot be empty string."),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [param("id").isMongoId().withMessage("Invalid category ID format."), validatorMiddleware];
