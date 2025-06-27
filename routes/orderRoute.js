const express = require("express");
const router = require("express").Router();

const {
  createCashOrder,
  createCheckoutSession,
  createCardOrder,
  getOrders,
  getOrder,
  setAsPaid,
  setAsDelivered,
} = require("../controllers/orderController");

const {
  createCashOrderValidator,
  createCheckoutSessionValidator,
  getOrderValidator,
  setAsPaidValidator,
  setAsDeliveredValidator,
} = require("../validators/orderValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.post("/cash-order", authenticate, allowTo("user"), createCashOrderValidator, createCashOrder);
router.post("/checkout-session", authenticate, allowTo("user"), createCheckoutSessionValidator, createCheckoutSession);
router.post("/card-order", express.raw({ type: "application/json" }), createCardOrder); // A little bit different, this is a webhook endpoint, it will be called by Stripe directly

router.get("/", authenticate, allowTo("user", "admin"), getOrders);
router.get("/:id", authenticate, allowTo("user", "admin"), getOrderValidator, getOrder);

router.patch("/:id/set-as-paid", authenticate, allowTo("admin"), setAsPaidValidator, setAsPaid);
router.patch("/:id/set-as-delivered", authenticate, allowTo("admin"), setAsDeliveredValidator, setAsDelivered);

module.exports = router;
