const router = require("express").Router();

const { uploadSingleImage } = require("../middlewares/uploadImagesMiddlewares");

const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  processBrandImage,
} = require("../controllers/brandController");

const {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../validators/brandValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.post(
  "/",
  authenticate,
  allowTo("admin"),
  uploadSingleImage("image"),
  processBrandImage,
  createBrandValidator,
  createBrand,
);

router.get("/", getBrands);
router.get("/:id", getBrandValidator, getBrand);

router.put(
  "/:id",
  authenticate,
  allowTo("admin"),
  uploadSingleImage("image"),
  processBrandImage,
  updateBrandValidator,
  updateBrand,
);

router.delete("/:id", authenticate, allowTo("admin"), deleteBrandValidator, deleteBrand);

module.exports = router;
