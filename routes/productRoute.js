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
} = require("../utils/validators/productValidator");

const { uploadMixedImages } = require("../middlewares/uploadImagesMiddleware");

router.post(
  "/",
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
  uploadMixedImages([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  processProductImages,
  updateProductValidator,
  updateProduct,
);

router.delete("/:id", deleteProductValidator, deleteProduct);

module.exports = router;
