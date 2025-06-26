const { param, body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.createCashOrderValidator = [
  body("address")
    .notEmpty()
    .withMessage("Address is required.")
    .bail()
    .isMongoId()
    .withMessage("Invalid address ID format."),
  validatorMiddleware,
];

exports.createCheckoutSessionValidator = [
  body("address")
    .notEmpty()
    .withMessage("Address is required.")
    .bail()
    .isMongoId()
    .withMessage("Invalid address ID format."),
  validatorMiddleware,
];

exports.getOrderValidator = [param("id").isMongoId().withMessage("Invalid order ID format."), validatorMiddleware];

exports.setAsPaidValidator = [param("id").isMongoId().withMessage("Invalid order ID format."), validatorMiddleware];

exports.setAsDeliveredValidator = [param("id").isMongoId().withMessage("Invalid order ID format."), validatorMiddleware];
