const asyncHandler = require("express-async-handler");
const ReviewModel = require("../models/reviewModel");
const factory = require("../utils/factory");

exports.createReview = factory.createDocument(ReviewModel, {
  preTask: asyncHandler(async (req) => (req.body.user = req.user._id)), // User ID is required.
});

exports.getReviews = factory.getAllDocuments(ReviewModel);

exports.getReview = factory.getDocument(ReviewModel);

exports.updateReview = factory.updateDocument(ReviewModel);

exports.deleteReview = factory.deleteDocument(ReviewModel);
