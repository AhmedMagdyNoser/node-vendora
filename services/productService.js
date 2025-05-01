const fs = require("fs");
const sharp = require("sharp");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ProductModal = require("../models/productModel");
const factory = require("../utils/factory");

// This middleware is used to process the images and create the filenames to be saved in the database.
exports.processProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  // Processing the cover image
  const coverImage = req.files.coverImage[0];
  if (coverImage) {
    const filename = `product-${slugify(req.body.title, { lower: true })}-cover-${Date.now()}.jpeg`;
    const buffer = await sharp(coverImage.buffer).resize(1000, 1000).toFormat("jpeg").jpeg({ quality: 95 }).toBuffer();
    req.coverImage = { buffer, filename };
    req.body.coverImage = filename;
  }

  // Processing the other images
  const images = req.files.images;
  if (images) {
    // We use `Promise.all` and `await` to ensure that all images are fully processed before continuing.
    req.images = await Promise.all(
      images.map(async (image, index) => {
        const filename = `product-${slugify(req.body.title, { lower: true })}-${Date.now()}-${index + 1}.jpeg`;
        const buffer = await sharp(image.buffer).resize(1000, 1000).toFormat("jpeg").jpeg({ quality: 95 }).toBuffer();
        return { buffer, filename };
      }),
    );
    // We map the filenames to the request body to be saved in the database.
    req.body.images = req.images.map((image) => image.filename);
  }

  console.log({ "req.body": req.body, "req.coverImage": req.coverImage, "req.images": req.images });

  next();
});

// A function to save the processed images
const saveProductImages = asyncHandler(async (req, res, next, product) => {
  if (req.coverImage) await sharp(req.coverImage.buffer).toFile(`uploads/products/${req.coverImage.filename}`);
  if (req.images)
    await Promise.all(
      req.images.map(async (image) => await sharp(image.buffer).toFile(`uploads/products/${image.filename}`)),
    );
});

// A function to delete the images
const deleteProductImages = (status) =>
  asyncHandler(async (req, res, next, product) => {
    if (status === "deleting") {
      if (product.coverImage) await fs.promises.unlink(`uploads/products/${product.coverImage}`);
      if (product.images && product.images.length > 0)
        await Promise.all(product.images.map(async (image) => await fs.promises.unlink(`uploads/products/${image}`)));
    }
  });

// =============================================================

exports.createProduct = factory.createDocument(ProductModal, { fieldToSlugify: "title", postTask: saveProductImages });

exports.getProducts = factory.getAllDocuments(ProductModal, { searchableFields: ["title", "description"] });

exports.getProduct = factory.getDocument(ProductModal);

exports.updateProduct = factory.updateDocument(ProductModal, { fieldToSlugify: "title" });

exports.deleteProduct = factory.deleteDocument(ProductModal, { preTask: deleteProductImages("deleting") });
