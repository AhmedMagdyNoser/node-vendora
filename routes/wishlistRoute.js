const router = require("express").Router();

const { addWishlistItem, deleteWishlistItem, getWishlist } = require("../controllers/wishlistController");

const { addWishlistItemValidator, deleteWishlistItemValidator } = require("../validators/wishlistValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.use(authenticate, allowTo("user"));

router
  .route("/")
  .post(addWishlistItemValidator, addWishlistItem)
  .delete(deleteWishlistItemValidator, deleteWishlistItem)
  .get(getWishlist);

module.exports = router;
