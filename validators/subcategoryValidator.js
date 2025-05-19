const { param, body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const CategoryModel = require("../models/categoryModel");

exports.createSubcategoryValidator = [
  body("title").trim().notEmpty().withMessage("Subcategory title is required."),
  body("description")
    .optional() // Ignore validation if the field is `undefined`.
    .trim()
    .notEmpty()
    .withMessage("Subcategory description cannot be empty string."),
  body("category")
    .notEmpty()
    .withMessage("Category ID is required.")
    .isMongoId()
    .withMessage("Invalid category ID format.")
    .bail() // Stop validation if the previous check fails
    .custom(async (value) => {
      const category = await CategoryModel.findById(value);
      if (!category) throw new Error(`Category with ID: \`${value}\` does not exist.`);
    }),
  validatorMiddleware,
];

exports.getSubcategoryValidator = [
  param("id").isMongoId().withMessage("Invalid subcategory ID format."),
  validatorMiddleware,
];

exports.updateSubcategoryValidator = [
  param("id").isMongoId().withMessage("Invalid subcategory ID format."),
  body("title")
    .optional() // Ignore validation if the field is `undefined`.
    .trim()
    .notEmpty()
    .withMessage("Subcategory title cannot be empty string."),
  body("description")
    .optional() // Ignore validation if the field is `undefined`.
    .trim()
    .notEmpty()
    .withMessage("Subcategory description cannot be empty string."),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format.")
    .bail() // Stop validation if the previous check fails
    .custom(async (value) => {
      const category = await CategoryModel.findById(value);
      if (!category) throw new Error(`Category with ID: \`${value}\` does not exist.`);
    }),
  validatorMiddleware,
];

exports.deleteSubcategoryValidator = [
  param("id").isMongoId().withMessage("Invalid subcategory ID format."),
  validatorMiddleware,
];
