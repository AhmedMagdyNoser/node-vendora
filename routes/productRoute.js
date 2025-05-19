const router = require("express").Router();

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  processProductImages,
} = require("../services/productService");

const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../validators/productValidator");

const { uploadMixedImages } = require("../middlewares/uploadImagesMiddlewares");
const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

router.post(
  "/",
  authenticate,
  allowTo("admin"),
  uploadMixedImages([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  processProductImages,
  createProductValidator,
  createProduct,
);

router.get("/", getProducts);
router.get("/:id", getProductValidator, getProduct);

router.put(
  "/:id",
  authenticate,
  allowTo("admin"),
  uploadMixedImages([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  processProductImages,
  updateProductValidator,
  updateProduct,
);

router.delete("/:id", authenticate, allowTo("admin"), deleteProductValidator, deleteProduct);

module.exports = router;
