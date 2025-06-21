const router = require("express").Router();

const { addCartItem, getCart, updateCartItemQuantity, deleteCartItem } = require("../controllers/cartController");

const {
  addCartItemValidator,
  updateCartItemQuantityValidator,
  deleteCartItemValidator,
} = require("../validators/cartValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.use(authenticate, allowTo("user"));

router.post("/", addCartItemValidator, addCartItem);
router.get("/", getCart);
router.patch("/:id", updateCartItemQuantityValidator, updateCartItemQuantity);
router.delete("/:id", deleteCartItemValidator, deleteCartItem);

module.exports = router;
