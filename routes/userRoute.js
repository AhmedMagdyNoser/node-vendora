const router = require("express").Router();

const { createUser, getUsers, getUser, updateUser, deleteUser, processUserImage } = require("../services/userService");

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
} = require("../validators/userValidator");

const { uploadSingleImage } = require("../middlewares/uploadImagesMiddlewares");
const { authenticate, allowTo } = require("../middlewares/protectionMiddlewares");

// Protect all routes with authentication and authorization
router.use(authenticate);
router.use(allowTo("admin"));

router.post("/", uploadSingleImage("image"), processUserImage, createUserValidator, createUser);
router.get("/", getUsers);
router.get("/:id", getUserValidator, getUser);
router.put("/:id", uploadSingleImage("image"), processUserImage, updateUserValidator, updateUser);
router.delete("/:id", deleteUserValidator, deleteUser);

module.exports = router;
