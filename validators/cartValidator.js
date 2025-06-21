const { param, body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.addCartItemValidator = [
  body("product")
    .notEmpty()
    .withMessage("Product ID is required.")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID format."),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .bail()
    .isNumeric()
    .withMessage("Quantity must be a number.")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Quantity must be an integer greater than 0."),
  validatorMiddleware,
];

exports.updateCartItemQuantityValidator = [
  param("id").isMongoId().withMessage("Invalid item ID format."),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .bail()
    .isNumeric()
    .withMessage("Quantity must be a number.")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Quantity must be an integer greater than 0."),
  validatorMiddleware,
];

exports.deleteCartItemValidator = [param("id").isMongoId().withMessage("Invalid item ID format."), validatorMiddleware];
