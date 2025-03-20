const { body, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const BrandModal = require("../../models/brandModel");
const CategoryModal = require("../../models/categoryModel");
const SubcategoryModal = require("../../models/subcategoryModel");

exports.createProductValidator = [
  body("title").notEmpty().withMessage("Product title is required.").trim(),
  body("description")
    .notEmpty()
    .withMessage("Product description is required.")
    .trim(),
  body("price")
    .notEmpty()
    .withMessage("Product price is required.")
    .isNumeric()
    .withMessage("Product price must be a number."),
  body("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product price after discount must be a number.")
    .custom((value, { req }) => {
      if (value > req.body.price)
        throw new Error(
          "Product price after discount must be less than product price"
        );
      else return true;
    }),
  body("quantity")
    .notEmpty()
    .withMessage("Product quantity is required.")
    .isNumeric()
    .withMessage("Product quantity must be a number.")
    .isInt()
    .withMessage("Product quantity must be an integer."),
  body("sold")
    .optional()
    .isNumeric()
    .withMessage("Product sold must be a number.")
    .isInt()
    .withMessage("Product sold must be an integer."),
  body("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid brand id format.")
    .custom(async (value) => {
      const brand = await BrandModal.findById(value);
      if (!brand) throw new Error(`Brand not found with id: ${value}.`);
      return true;
    }),
  body("category")
    .notEmpty()
    .withMessage("Product category is required.")
    .isMongoId()
    .withMessage("Invalid category id format.")
    .custom(async (value) => {
      const category = await CategoryModal.findById(value);
      if (!category) throw new Error(`Category not found with id: ${value}.`);
      return true;
    }),
  body("subcategory")
    .notEmpty()
    .withMessage("Product subcategory is required.")
    .isMongoId()
    .withMessage("Invalid subcategory id format.")
    .custom(async (value, { req }) => {
      const subcategory = await SubcategoryModal.findById(value);
      if (!subcategory)
        throw new Error(`Subcategory not found with id: ${value}.`);
      else if (subcategory.category.toString() !== req.body.category)
        throw new Error(
          `The subcategory provided does not belong to the category provided.`
        );
      return true;
    }),
  validatorMiddleware,
];

exports.getProductValidator = [
  param("id").isMongoId().withMessage("Invalid product id format."),
  validatorMiddleware,
];

exports.updateProductValidator = [
  param("id").isMongoId().withMessage("Invalid product id format."),
  body("title").optional().trim(),
  body("description").optional().trim(),
  body("price").optional().isNumeric().withMessage("Price must be a number."),
  body("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Price after discount must be a number.")
    .custom((value, { req }) => {
      if (value > req.body.price)
        throw new Error(
          "Product price after discount must be less than product price"
        );
      else return true;
    }),
  body("quantity")
    .optional()
    .isNumeric()
    .withMessage("Quantity must be a number.")
    .isInt()
    .withMessage("Quantity must be an integer."),
  body("sold")
    .optional()
    .isNumeric()
    .withMessage("Sold must be a number.")
    .isInt()
    .withMessage("Sold must be an integer."),
  body("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid brand id format.")
    .custom(async (value) => {
      const brand = await BrandModal.findById(value);
      if (!brand) throw new Error(`Brand not found with id: ${value}.`);
      return true;
    }),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category id format.")
    .custom(async (value) => {
      const category = await CategoryModal.findById(value);
      if (!category) throw new Error(`Category not found with id: ${value}.`);
      return true;
    }),
  body("subcategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory id format.")
    .custom(async (value, { req }) => {
      const subcategory = await SubcategoryModal.findById(value);
      if (!subcategory)
        throw new Error(`Subcategory not found with id: ${value}.`);
      else if (subcategory.category.toString() !== req.body.category)
        throw new Error(
          `The subcategory provided does not belong to the category provided.`
        );
      return true;
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  param("id").isMongoId().withMessage("Invalid product id format"),
  validatorMiddleware,
];
