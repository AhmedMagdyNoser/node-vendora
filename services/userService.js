const fs = require("fs");
const sharp = require("sharp");
const slugify = require("slugify");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const UserModal = require("../models/userModel");
const factory = require("../utils/factory");

// This middleware is used to process the image and create the filename to be saved in the database.
exports.processUserImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  // Generate a unique filename for the image
  const filename = `user-${slugify(req.body.name, { lower: true })}-${Date.now()}.jpeg`;
  // Process the image and store it in memory
  const buffer = await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({ quality: 95 }).toBuffer();
  // Store the processed image and filename in the request object
  req.image = { buffer, filename };
  // Set the image filename in the request body for database storage
  req.body.image = filename;
  next();
});

// A function to save the processed image
const saveUserImage = asyncHandler(async (req, res, next) => {
  if (!req.image) return;
  await sharp(req.image.buffer).toFile(`uploads/users/${req.image.filename}`);
});

// A function to delete the image
const deleteUserImage = (status) =>
  asyncHandler(async (req, res, next, user) => {
    // If the status is updating and there is a new image, delete the old image if it exists.
    if (status === "updating" && req.file && user.image) await fs.promises.unlink(`uploads/users/${user.image}`);
    // If the status is deleting, delete the image if it exists.
    if (status === "deleting" && user.image) await fs.promises.unlink(`uploads/users/${user.image}`);
  });

// A function to hash the password
const hashPassword = asyncHandler(async (req, res, next) => {
  if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, 12);
});

// =============================================================

exports.createUser = factory.createDocument(UserModal, {
  preTask: hashPassword,
  postTask: saveUserImage,
});

exports.getUsers = factory.getAllDocuments(UserModal, { searchableFields: ["name", "email", "phone"] });

exports.getUser = factory.getDocument(UserModal);

exports.updateUser = factory.updateDocument(UserModal, {
  preTask: asyncHandler(async (req, res, next, user) => {
    await deleteUserImage("updating")(req, res, next, user);
    await hashPassword(req, res, next);
  }),
  postTask: saveUserImage,
});

exports.deleteUser = factory.deleteDocument(UserModal, { preTask: deleteUserImage("deleting") });
