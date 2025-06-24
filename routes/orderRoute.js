const router = require("express").Router();

const { createCashOrder } = require("../controllers/orderController");

const { createCashOrderValidator } = require("../validators/orderValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.use(authenticate);

router.post("/", allowTo("user"), createCashOrderValidator, createCashOrder);

// Update Status (For Admin)
// Set as Paid (For Admin)

module.exports = router;
