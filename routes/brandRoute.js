const router = require("express").Router();

const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  processBrandImage,
} = require("../services/brandService");

const {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validators/brandValidator");

router.post("/", uploadSingleImage("image"), processBrandImage, createBrandValidator, createBrand);
router.get("/", getBrands);
router.get("/:id", getBrandValidator, getBrand);
router.put("/:id", uploadSingleImage("image"), processBrandImage, updateBrandValidator, updateBrand);
router.delete("/:id", deleteBrandValidator, deleteBrand);

module.exports = router;
