const { body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ProductModel = require("../models/productModel");

exports.addWishlistItemValidator = [
  body("product")
    .notEmpty()
    .withMessage("Product ID is required.")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID format.")
    .bail()
    .custom(async (value) => {
      const product = await ProductModel.findById(value);
      if (!product) throw new Error(`Product with ID: \`${value}\` does not exist.`);
    }),
  validatorMiddleware,
];

exports.deleteWishlistItemValidator = [
  body("product")
    .notEmpty()
    .withMessage("Product ID is required.")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID format."),
  validatorMiddleware,
];
