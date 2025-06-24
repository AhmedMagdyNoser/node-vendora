const router = require("express").Router();

const {
  createCashOrder,
  listBasedOnRole,
  getOrders,
  getOrder,
  setAsPaid,
  setAsDelivered,
} = require("../controllers/orderController");

const {
  createCashOrderValidator,
  getOrderValidator,
  setAsPaidValidator,
  setAsDeliveredValidator,
} = require("../validators/orderValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.use(authenticate);

router.post("/", allowTo("user"), createCashOrderValidator, createCashOrder);
router.get("/", allowTo("user", "admin"), listBasedOnRole, getOrders);
router.get("/:id", allowTo("user", "admin"), getOrderValidator, getOrder);
router.patch("/:id/set-as-paid", allowTo("admin"), setAsPaidValidator, setAsPaid);
router.patch("/:id/set-as-delivered", allowTo("admin"), setAsDeliveredValidator, setAsDelivered);

module.exports = router;
