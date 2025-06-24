const { body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.createCashOrderValidator = [
  body("address").notEmpty().withMessage("Address is required.").isMongoId().withMessage("Invalid address ID format."),
  validatorMiddleware,
];
