const { param, body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");

exports.addAddressValidator = [
  body("alias").trim().notEmpty().withMessage("Alias is required."),
  body("city").trim().notEmpty().withMessage("City is required."),
  body("details").trim().notEmpty().withMessage("Details are required."),
  validatorMiddleware,
];

exports.getAddressValidator = [param("id").isMongoId().withMessage("Invalid address ID format."), validatorMiddleware];

exports.updateAddressValidator = [
  param("id").isMongoId().withMessage("Invalid address ID format."),
  body("alias").optional().trim().notEmpty().withMessage("Alias must not be empty."),
  body("city").optional().trim().notEmpty().withMessage("City must not be empty."),
  body("details").optional().trim().notEmpty().withMessage("Details must not be empty."),
  validatorMiddleware,
];

exports.deleteAddressValidator = [param("id").isMongoId().withMessage("Invalid address ID format."), validatorMiddleware];
