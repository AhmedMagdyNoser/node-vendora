const router = require("express").Router();

const {
  updateProfile,
  updatePassword,
  processImage,
  updateImage,
  deleteImage,
  deleteAccount,
} = require("../controllers/profileController");

const {
  updateProfileValidator,
  updatePasswordValidator,
  updateImageValidator,
  deleteAccountValidator,
} = require("../validators/profileValidator");

const { uploadSingleImage } = require("../middlewares/uploadImagesMiddlewares");
const { authenticate } = require("../middlewares/protectionMiddlewares");

router.use(authenticate); // Protect all routes.

router.put("/", updateProfileValidator, updateProfile);
router.patch("/password", updatePasswordValidator, updatePassword);
router.patch("/image", uploadSingleImage("image"), processImage, updateImageValidator, updateImage);
router.delete("/image", deleteImage);
router.delete("/", deleteAccountValidator, deleteAccount);

module.exports = router;
