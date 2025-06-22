const { param, body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const CouponModel = require("../models/couponModel");

exports.createCouponValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Code is required.")
    .bail()
    .custom(async (value) => {
      const coupon = await CouponModel.findOne({ code: value });
      if (coupon) throw new Error("Coupon with this code already exists.");
    }),
  body("discount")
    .notEmpty()
    .withMessage("Discount is required.")
    .bail()
    .isNumeric()
    .withMessage("Discount must be a number.")
    .bail()
    .isFloat({ gt: 0, lt: 100 })
    .withMessage("Discount must be greater than 0 and less than 100."),
  body("expirationDate")
    .notEmpty()
    .withMessage("Expiration date is required.")
    .bail()
    .isISO8601()
    .withMessage("Expiration date must be a valid date in ISO 8601 format."),
  // "2025-06-19" OR "2025-06-19T15:30:00Z" are valid
  body("maxUsage")
    .notEmpty()
    .withMessage("Max usage is required.")
    .bail()
    .isNumeric()
    .withMessage("Max usage must be a number.")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Max usage must be an integer greater than 0."),
  validatorMiddleware,
];

exports.getCouponValidator = [param("id").isMongoId().withMessage("Invalid coupon ID format."), validatorMiddleware];

exports.updateCouponValidator = [
  param("id").isMongoId().withMessage("Invalid coupon ID format."),
  body("code")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Code cannot be empty.")
    .bail()
    .custom(async (value, { req }) => {
      const coupon = await CouponModel.findOne({ code: value, _id: { $ne: req.params.id } });
      if (coupon) throw new Error("Coupon with this code already exists.");
    }),
  body("discount")
    .optional()
    .isNumeric()
    .withMessage("Discount must be a number.")
    .bail()
    .isFloat({ gt: 0, lt: 100 })
    .withMessage("Discount must be greater than 0 and less than 100."),
  body("expirationDate").optional().isISO8601().withMessage("Expiration date must be a valid date in ISO 8601 format."),
  // "2025-06-19" OR "2025-06-19T15:30:00Z" are valid
  body("maxUsage")
    .optional()
    .isNumeric()
    .withMessage("Max usage must be a number.")
    .bail()
    .isInt({ gt: 0 })
    .withMessage("Max usage must be an integer greater than 0."),
  validatorMiddleware,
];

exports.deleteCouponValidator = [param("id").isMongoId().withMessage("Invalid coupon ID format."), validatorMiddleware];
