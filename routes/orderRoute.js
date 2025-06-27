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

router.use(authenticate);

router.post("/cash-order", allowTo("user"), createCashOrderValidator, createCashOrder);
router.post("/checkout-session", allowTo("user"), createCheckoutSessionValidator, createCheckoutSession);
router.post("/card-order", express.raw({ type: "application/json" }), createCardOrder);

router.get("/", allowTo("user", "admin"), getOrders);
router.get("/:id", allowTo("user", "admin"), getOrderValidator, getOrder);

router.patch("/:id/set-as-paid", allowTo("admin"), setAsPaidValidator, setAsPaid);
router.patch("/:id/set-as-delivered", allowTo("admin"), setAsDeliveredValidator, setAsDelivered);

module.exports = router;
