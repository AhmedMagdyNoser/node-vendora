const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getCategoryValidator = [check("id").isMongoId().withMessage("Invalid category id format"), validatorMiddleware];

exports.createCategoryValidator = [
  check("title")
    .notEmpty()
    .withMessage("Category title is required.")
    .isLength({ min: 3 })
    .withMessage("Category title must be at least 3 characters long.")
    .isLength({ max: 32 })
    .withMessage("Category title must be at most 32 characters long.")
    .trim(),
  check("description")
    .optional()
    .isLength({ max: 250 })
    .withMessage("Category description must be at most 250 characters long.")
    .trim(),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Category title must be at least 3 characters long.")
    .isLength({ max: 32 })
    .withMessage("Category title must be at most 32 characters long.")
    .trim(),
  check("description")
    .optional()
    .isLength({ max: 250 })
    .withMessage("Category description must be at most 250 characters long.")
    .trim(),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [check("id").isMongoId().withMessage("Invalid category id format"), validatorMiddleware];
