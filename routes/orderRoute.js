const router = require("express").Router();

const { createCashOrder, listBasedOnRole, getOrders, getOrder } = require("../controllers/orderController");

const { createCashOrderValidator, getOrderValidator } = require("../validators/orderValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.use(authenticate);

router.post("/", allowTo("user"), createCashOrderValidator, createCashOrder);
router.get("/", allowTo("user", "admin"), listBasedOnRole, getOrders);
router.get("/:id", allowTo("user", "admin"), getOrderValidator, getOrder);

// Set as Delivered (For Admin)
// Set as Paid (For Admin)

module.exports = router;
