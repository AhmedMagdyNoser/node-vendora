const router = require("express").Router();

const {
  cleanBody,
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

const {
  createCouponValidator,
  getCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
} = require("../validators/couponValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.use(authenticate, allowTo("admin"));

router.post("/", cleanBody, createCouponValidator, createCoupon);
router.get("/", getCoupons);
router.get("/:id", getCouponValidator, getCoupon);
router.put("/:id", cleanBody, updateCouponValidator, updateCoupon);
router.delete("/:id", deleteCouponValidator, deleteCoupon);

module.exports = router;
