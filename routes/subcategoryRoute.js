const router = require("express").Router();

const {
  createSubcategory,
  getSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require("../controllers/subcategoryController");

const {
  createSubcategoryValidator,
  getSubcategoryValidator,
  updateSubcategoryValidator,
  deleteSubcategoryValidator,
} = require("../validators/subcategoryValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.post("/", authenticate, allowTo("admin"), createSubcategoryValidator, createSubcategory);
router.get("/", getSubcategories);
router.get("/:id", getSubcategoryValidator, getSubcategory);
router.put("/:id", authenticate, allowTo("admin"), updateSubcategoryValidator, updateSubcategory);
router.delete("/:id", authenticate, allowTo("admin"), deleteSubcategoryValidator, deleteSubcategory);

module.exports = router;
