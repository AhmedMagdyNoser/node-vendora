const { body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ProductModel = require("../models/productModel");

exports.addWishlistItemValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required.")
    .isMongoId()
    .withMessage("Invalid product ID format.")
    .custom(async (value) => {
      const product = await ProductModel.findById(value);
      if (!product) throw new Error(`Product with ID: \`${value}\` does not exist.`);
    }),
  validatorMiddleware,
];

exports.deleteWishlistItemValidator = [
  body("productId").notEmpty().withMessage("Product ID is required.").isMongoId().withMessage("Invalid product ID format."),
  validatorMiddleware,
];
