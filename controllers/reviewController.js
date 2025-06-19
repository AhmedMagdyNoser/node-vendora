const asyncHandler = require("express-async-handler");
const ReviewModel = require("../models/reviewModel");
const productModel = require("../models/productModel");
const factory = require("../utils/factory");

const calcRating = asyncHandler(async (req, res, next, review) => {
  const productId = review.product;
  const results = await ReviewModel.aggregate([
    // Stage 1: Matching (Find all reviews that belong to this product)
    { $match: { product: productId } },
    // Stage 2: Grouping (Group those reviews together)
    {
      $group: {
        _id: "$product", // Group by the `product` field. All reviews for the same product will be combined.
        rating: { $avg: "$rating" }, // Calculate the average of the `rating` field.
        ratingsCount: { $sum: 1 }, // Count how many reviews there are.
      },
    },
  ]);

  // `results` will look like: [{ _id: <productId>, rating: 4.5, ratingsCount: 10 }]

  if (results.length > 0) {
    const { rating, ratingsCount } = results[0];
    await productModel.findByIdAndUpdate(productId, { rating, ratingsCount });
  } else await productModel.findByIdAndUpdate(productId, { rating: 0, ratingsCount: 0 });
});

const population = { path: "user", select: "name" };

// =============================================================

exports.createReview = factory.createDocument(ReviewModel, {
  preTask: asyncHandler(async (req) => (req.body.user = req.user._id)), // User ID is required.
  populate: population,
  postTask: calcRating,
});

exports.getReviews = factory.getAllDocuments(ReviewModel, { populate: population });

exports.getReview = factory.getDocument(ReviewModel, { populate: population });

exports.updateReview = factory.updateDocument(ReviewModel, { populate: population, postTask: calcRating });

exports.deleteReview = factory.deleteDocument(ReviewModel, { postTask: calcRating });
