const router = require("express").Router();

const {
  processUserImage,
  cleanBody,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
} = require("../validators/userValidator");

const { uploadSingleImage } = require("../middlewares/uploadImagesMiddlewares");
const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

// Protect all routes with authentication and authorization
router.use(authenticate, allowTo("admin"));

router.post("/", uploadSingleImage("image"), processUserImage, cleanBody, createUserValidator, createUser);
router.get("/", getUsers);
router.get("/:id", getUserValidator, getUser);
router.put("/:id", uploadSingleImage("image"), processUserImage, cleanBody, updateUserValidator, updateUser);
router.delete("/:id", deleteUserValidator, deleteUser);

module.exports = router;
