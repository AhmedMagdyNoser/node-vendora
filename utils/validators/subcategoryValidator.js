const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getSubcategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  validatorMiddleware,
];

exports.createSubcategoryValidator = [
  check("title")
    .notEmpty()
    .withMessage("Subcategory title is required.")
    .isLength({ min: 3 })
    .withMessage("Subcategory title must be at least 3 characters long.")
    .isLength({ max: 32 })
    .withMessage("Subcategory title must be at most 32 characters long.")
    .trim(),
  check("description")
    .optional()
    .isLength({ max: 250 })
    .withMessage("Subcategory description must be at most 250 characters long.")
    .trim(),
  check("category").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.updateSubcategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Subcategory title must be at least 3 characters long.")
    .isLength({ max: 32 })
    .withMessage("Subcategory title must be at most 32 characters long.")
    .trim(),
  check("description")
    .optional()
    .isLength({ max: 250 })
    .withMessage("Subcategory description must be at most 250 characters long.")
    .trim(),
  check("category").optional().isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.deleteSubcategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  validatorMiddleware,
];
