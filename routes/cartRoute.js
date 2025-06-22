const router = require("express").Router();

const {
  addCartItem,
  getCart,
  updateCartItemQuantity,
  deleteCartItem,
  applyCoupon,
  revokeCoupon,
} = require("../controllers/cartController");

const {
  addCartItemValidator,
  updateCartItemQuantityValidator,
  deleteCartItemValidator,
  applyCouponValidator,
} = require("../validators/cartValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.use(authenticate, allowTo("user"));

router.post("/", addCartItemValidator, addCartItem);
router.get("/", getCart);
router.patch("/:id", updateCartItemQuantityValidator, updateCartItemQuantity);
router.delete("/:id", deleteCartItemValidator, deleteCartItem);

router.post("/apply-coupon", applyCouponValidator, applyCoupon);
router.post("/revoke-coupon", revokeCoupon);

module.exports = router;
