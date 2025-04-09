const multer = require("multer");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const BrandModal = require("../models/brandModel");
const factory = require("../utils/factory");
const ApiError = require("../utils/apiError");

// // The disk storage object gives you full control on storing files to disk.
// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => callback(null, "uploads/brands"), // `null` means no error.
//   filename: (req, file, callback) => {
//     const extension = file.mimetype.split("/")[1];
//     const filename = `brand-${req.body.name.toLowerCase()}-${Date.now()}.${extension}`;
//     req.body.image = filename; // Save the filename to the request body to be saved in the database.
//     callback(null, filename); // `null` means no error.
//   },
// });

// The memory storage object stores the files in memory as Buffer objects.
const multerStorage = multer.memoryStorage();

// The file filter function is used to filter the files that are uploaded.
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image"))
    callback(null, true); // `null` means no error.
  else callback(new ApiError(400, "Not an image! Please upload only images."), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// The upload middleware is used to handle multipart/form-data, which is used for uploading files.
exports.uploadBrandImage = upload.single("image");

// The processBrandImage middleware is used to resize the image before saving it to disk.
exports.processBrandImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `brand-${req.body.name.toLowerCase()}-${Date.now()}.jpeg`;

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
