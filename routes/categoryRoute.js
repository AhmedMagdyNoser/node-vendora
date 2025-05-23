const router = require("express").Router();

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  createCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../validators/categoryValidator");

const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.post("/", authenticate, allowTo("admin"), createCategoryValidator, createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryValidator, getCategory);
router.put("/:id", authenticate, allowTo("admin"), updateCategoryValidator, updateCategory);
router.delete("/:id", authenticate, allowTo("admin"), deleteCategoryValidator, deleteCategory);

module.exports = router;
