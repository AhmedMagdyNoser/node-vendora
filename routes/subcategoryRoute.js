const router = require("express").Router();

const {
  createSubcategory,
  getSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require("../services/subcategoryService");

const {
  createSubcategoryValidator,
  getSubcategoryValidator,
  updateSubcategoryValidator,
  deleteSubcategoryValidator,
} = require("../utils/validators/subcategoryValidator");

router.post("/", createSubcategoryValidator, createSubcategory);
router.get("/", getSubcategories);
router.get("/:id", getSubcategoryValidator, getSubcategory);
router.put("/:id", updateSubcategoryValidator, updateSubcategory);
router.delete("/:id", deleteSubcategoryValidator, deleteSubcategory);

module.exports = router;
