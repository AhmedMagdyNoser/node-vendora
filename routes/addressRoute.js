const router = require("express").Router();

const { addAddress, getAddresses, getAddress, updateAddress, deleteAddress } = require("../controllers/addressController");

const {
  addAddressValidator,
  getAddressValidator,
  updateAddressValidator,
  deleteAddressValidator,
} = require("../validators/addressValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.use(authenticate, allowTo("user"));

router.post("/", addAddressValidator, addAddress);
router.get("/", getAddresses);
router.get("/:id", getAddressValidator, getAddress);
router.put("/:id", updateAddressValidator, updateAddress);
router.delete("/:id", deleteAddressValidator, deleteAddress);

module.exports = router;
