const router = require("express").Router();

const {
  removeImmutableFields,
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../validators/reviewValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.post("/", authenticate, allowTo("user"), createReviewValidator, createReview);
router.get("/", getReviews);
router.get("/:id", getReviewValidator, getReview);
router.put("/:id", authenticate, allowTo("user"), removeImmutableFields, updateReviewValidator, updateReview); // Uesr should be allowed to update his own reviews only (See `reviewValidator.js`)
router.delete("/:id", authenticate, allowTo("user", "admin"), deleteReviewValidator, deleteReview); // Admin can delete any review, but user should be allowed to delete his own reviews only (See `reviewValidator.js`)

module.exports = router;
