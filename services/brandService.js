const sharp = require("sharp");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const BrandModal = require("../models/brandModel");
const factory = require("../utils/factory");

// This middleware is used to process the image, save it to disk then save the filename to the database.
exports.processBrandImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `brand-${slugify(req.body.name, { lower: true })}-${Date.now()}.jpeg`;

  // In case of memory storage, the file is stored in memory as a Buffer object:
  await sharp(req.file.buffer)
    .resize(1000, 1000)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/brands/${filename}`); // Save the image to disk.

  req.body.image = filename; // Save the filename to the request body to be saved in the database.

  next();
});

// =============================================================

exports.createBrand = factory.createDocument(BrandModal, { fieldToSlugify: "name" });

exports.getBrands = factory.getAllDocuments(BrandModal, { searchableFields: ["name"] });

exports.getBrand = factory.getDocument(BrandModal);

exports.updateBrand = factory.updateDocument(BrandModal, { fieldToSlugify: "name" });

exports.deleteBrand = factory.deleteDocument(BrandModal);
