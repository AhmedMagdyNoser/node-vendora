const { param, body } = require("express-validator");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ReviewModel = require("../models/reviewModel");
const ProductModel = require("../models/productModel");

exports.createReviewValidator = [
  body("title").optional().trim(),
  body("rating")
    .notEmpty()
    .withMessage("Rating is required.")
    .bail()
    .isInt()
    .withMessage("Rating must be an integer.")
    .bail()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5."),
  body("product")
    .notEmpty()
    .withMessage("Product ID is required.")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID format.")
    .bail()
    .custom(async (value, { req }) => {
      const product = await ProductModel.findById(value);
      if (!product) throw new Error(`Product with ID: \`${value}\` does not exist.`);
      const review = await ReviewModel.findOne({ user: req.user._id, product: value });
      if (review) throw new Error("You've already created a review to this product before.");
    }),
  // User ID will be set in the creation middleware.
  validatorMiddleware,
];

exports.getReviewValidator = [param("id").isMongoId().withMessage("Invalid review ID format."), validatorMiddleware];

exports.updateReviewValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID format.")
    .bail()
    .custom(async (value, { req }) => {
      const review = await ReviewModel.findById(value);
      if (!review) throw new Error(`Review with ID: \`${value}\` does not exist.`);
      if (review.user.toString() !== req.user._id.toString()) throw new Error("You're allowed to update your reviews only.");
    }),
  body("title").optional().trim(),
  body("rating")
    .optional()
    .isInt()
    .withMessage("Rating must be an integer.")
    .bail()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5."),
  // Delete specific fields from the request body if they exist to prevent them from being updated in the factory.
  (req, res, next) => {
    delete req.body.user;
    delete req.body.product;
    next();
  },
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID format.")
    .bail()
    .custom(async (value, { req }) => {
      const review = await ReviewModel.findById(value);
      if (!review) throw new Error(`Review with ID: \`${value}\` does not exist.`);
      if (req.user.role === "user" && review.user.toString() !== req.user._id.toString())
        throw new Error("You're allowed to delete your reviews only.");
    }),
  validatorMiddleware,
];
