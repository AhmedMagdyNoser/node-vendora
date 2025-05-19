const fs = require("fs");
const sharp = require("sharp");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const BrandModel = require("../models/brandModel");
const factory = require("../utils/factory");

// This middleware is used to process the image and create the filename to be saved in the database.
exports.processBrandImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  // Generate a unique filename for the image
  const filename = `brand-${slugify(req.body.name, { lower: true })}-${Date.now()}.jpeg`;
  // Process the image and store it in memory
  const buffer = await sharp(req.file.buffer).resize(1000, 1000).toFormat("jpeg").jpeg({ quality: 95 }).toBuffer();
  // Store the processed image and filename in the request object
  req.image = { buffer, filename };
  // Set the image filename in the request body for database storage
  req.body.image = filename;
  next();
});

// A function to save the processed image
const saveBrandImage = asyncHandler(async (req) => {
  if (!req.image) return;
  await sharp(req.image.buffer).toFile(`uploads/brands/${req.image.filename}`);
});

// A function to delete the image
const deleteBrandImage = (status) =>
  asyncHandler(async (req, res, next, brand) => {
    // If the status is updating and there is a new image, delete the old image if it exists.
    if (status === "updating" && req.file && brand.image) await fs.promises.unlink(`uploads/brands/${brand.image}`);
    // If the status is deleting, delete the image if it exists.
    if (status === "deleting" && brand.image) await fs.promises.unlink(`uploads/brands/${brand.image}`);
  });

// =============================================================

exports.createBrand = factory.createDocument(BrandModel, { fieldToSlugify: "name", postTask: saveBrandImage });

exports.getBrands = factory.getAllDocuments(BrandModel, { searchableFields: ["name"] });

exports.getBrand = factory.getDocument(BrandModel);

exports.updateBrand = factory.updateDocument(BrandModel, {
  fieldToSlugify: "name",
  preTask: deleteBrandImage("updating"),
  postTask: saveBrandImage,
});

exports.deleteBrand = factory.deleteDocument(BrandModel, { preTask: deleteBrandImage("deleting") });
