const router = require("express").Router();

const { createUser, getUsers, getUser, updateUser, deleteUser, processUserImage } = require("../services/userService");

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
} = require("../utils/validators/userValidator");

const { uploadSingleImage } = require("../middlewares/uploadImagesMiddleware");

router.post("/", uploadSingleImage("image"), processUserImage, createUserValidator, createUser);
router.get("/", getUsers);
router.get("/:id", getUserValidator, getUser);
router.put("/:id", uploadSingleImage("image"), processUserImage, updateUserValidator, updateUser);
router.delete("/:id", deleteUserValidator, deleteUser);

module.exports = router;
