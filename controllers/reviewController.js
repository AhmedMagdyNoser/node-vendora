const asyncHandler = require("express-async-handler");
const ReviewModel = require("../models/reviewModel");
const factory = require("../utils/factory");

const population = { path: "user", select: "name" };

exports.createReview = factory.createDocument(ReviewModel, {
  preTask: asyncHandler(async (req) => (req.body.user = req.user._id)), // User ID is required.
  populate: population,
});

exports.getReviews = factory.getAllDocuments(ReviewModel, { populate: population });

exports.getReview = factory.getDocument(ReviewModel, { populate: population });

exports.updateReview = factory.updateDocument(ReviewModel, { populate: population });

exports.deleteReview = factory.deleteDocument(ReviewModel);
