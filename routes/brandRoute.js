const router = require("express").Router();

const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} = require("../services/brandService");

const {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validators/brandValidator");

router.post("/", createBrandValidator, createBrand);
router.get("/", getBrands);
router.get("/:id", getBrandValidator, getBrand);
router.put("/:id", updateBrandValidator, updateBrand);
router.delete("/:id", deleteBrandValidator, deleteBrand);

module.exports = router;
