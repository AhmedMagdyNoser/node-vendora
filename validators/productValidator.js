const { param, body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const BrandModel = require("../models/brandModel");
const CategoryModel = require("../models/categoryModel");
const SubcategoryModel = require("../models/subcategoryModel");

exports.createProductValidator = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("price")
    .notEmpty()
    .withMessage("Price is required.")
    .bail()
    .isNumeric()
    .withMessage("Price must be a number.")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0."),
  body("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Price after discount must be a number.")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Price after discount must be greater than 0.")
    .bail()
    .custom(async (value, { req }) => {
      if (value > req.body.price) throw new Error("Price after discount must be less than the original price.");
    }),
  body("coverImage").trim().notEmpty().withMessage("Cover image is required."),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array.")
    .bail()
    .isArray({ max: 5 })
    .withMessage("Images must be less than or equal to 5."),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .bail()
    .isNumeric()
    .withMessage("Quantity must be a number.")
    .bail()
    .isInt()
    .withMessage("Quantity must be an integer.")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Quantity must be greater than 0."),
  body("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid brand ID format.")
    .bail()
    .custom(async (value) => {
      const brand = await BrandModel.findById(value);
      if (!brand) throw new Error(`Brand with ID: \`${value}\` does not exist.`);
    }),
  body("category")
    .notEmpty()
    .withMessage("Category ID is required.")
    .bail()
    .isMongoId()
    .withMessage("Invalid category ID format.")
    .bail()
    .custom(async (value) => {
      const category = await CategoryModel.findById(value);
      if (!category) throw new Error(`Category with ID: \`${value}\` does not exist.`);
    }),
  body("subcategory")
    .notEmpty()
    .withMessage("Subcategory ID is required.")
    .bail()
    .isMongoId()
    .withMessage("Invalid subcategory ID format.")
    .bail()
    .custom(async (value, { req }) => {
      const subcategory = await SubcategoryModel.findById(value);
      if (!subcategory) throw new Error(`Subcategory with ID: \`${value}\` does not exist.`);
      else if (subcategory.category.toString() !== req.body.category)
        throw new Error(`The subcategory provided does not belong to the category provided.`);
    }),
  // Delete specific fields from the request body if they exist to prevent them from being updated in the factory.
  (req, res, next) => {
    delete req.body.sold;
    delete req.body.rating;
    delete req.body.ratingsCount;
    next();
  },
  validatorMiddleware,
];

exports.getProductValidator = [param("id").isMongoId().withMessage("Invalid product ID format."), validatorMiddleware];

exports.updateProductValidator = [
  param("id").isMongoId().withMessage("Invalid product ID format."),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty string."),
  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty string."),
  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number.")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0."),
  body("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Price after discount must be a number.")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Price after discount must be greater than 0.")
    .bail()
    .custom((value, { req }) => {
      if (value > req.body.price) throw new Error("Price after discount must be less than the original price.");
    }),
  body("coverImage").optional().trim().notEmpty().withMessage("Cover image cannot be empty string."),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array.")
    .bail()
    .isArray({ max: 5 })
    .withMessage("Images must be less than or equal to 5."),
  body("quantity")
    .optional()
    .isNumeric()
    .withMessage("Quantity must be a number.")
    .bail()
    .isInt()
    .withMessage("Quantity must be an integer.")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Quantity must be greater than 0."),
  body("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid brand ID format.")
    .bail()
    .custom(async (value) => {
      const brand = await BrandModel.findById(value);
      if (!brand) throw new Error(`Brand with ID: \`${value}\` does not exist.`);
    }),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format.")
    .bail()
    .custom(async (value) => {
      const category = await CategoryModel.findById(value);
      if (!category) throw new Error(`Category with ID: \`${value}\` does not exist.`);
    }),
  body("subcategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID format.")
    .bail()
    .custom(async (value, { req }) => {
      const subcategory = await SubcategoryModel.findById(value);
      if (!subcategory) throw new Error(`Subcategory with ID: \`${value}\` does not exist.`);
      else if (subcategory.category.toString() !== req.body.category)
        throw new Error(`The subcategory provided does not belong to the category provided.`);
    }),
  // Delete specific fields from the request body if they exist to prevent them from being updated in the factory.
  (req, res, next) => {
    delete req.body.sold;
    delete req.body.rating;
    delete req.body.ratingsCount;
    next();
  },
  validatorMiddleware,
];

exports.deleteProductValidator = [param("id").isMongoId().withMessage("Invalid product ID format."), validatorMiddleware];
