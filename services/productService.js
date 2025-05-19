const fs = require("fs");
const sharp = require("sharp");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ProductModel = require("../models/productModel");
const factory = require("../utils/factory");

// This middleware is used to process the images and create the filenames to be saved in the database.
exports.processProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  // Processing the cover image
  if (req.files.coverImage) {
    const coverImage = req.files.coverImage[0];
    const filename = `product-${slugify(req.body.title, { lower: true })}-cover-${Date.now()}.jpeg`;
    const buffer = await sharp(coverImage.buffer).resize(1000, 1000).toFormat("jpeg").jpeg({ quality: 95 }).toBuffer();
    req.coverImage = { buffer, filename };
    req.body.coverImage = filename;
  }

  // Processing the other images
  if (req.files.images) {
    const images = req.files.images;
    // Use `await Promise.all` to ensure that all images are fully processed before continuing.
    req.images = await Promise.all(
      images.map(async (image, index) => {
        const filename = `product-${slugify(req.body.title, { lower: true })}-${Date.now()}-${index + 1}.jpeg`;
        const buffer = await sharp(image.buffer).resize(1000, 1000).toFormat("jpeg").jpeg({ quality: 95 }).toBuffer();
        return { buffer, filename };
      }),
    );
    // Map the filenames to the request body to be saved in the database.
    req.body.images = req.images.map((image) => image.filename);
  }

  next();
});

// A function to save the processed images
const saveProductImages = asyncHandler(async (req) => {
  if (req.coverImage) await sharp(req.coverImage.buffer).toFile(`uploads/products/${req.coverImage.filename}`);
  if (req.images)
    await Promise.all(
      req.images.map(async (image) => await sharp(image.buffer).toFile(`uploads/products/${image.filename}`)),
    );
});

// A function to delete the images
const deleteProductImages = (status) =>
  asyncHandler(async (req, res, next, product) => {
    if (status === "updating") {
      if (req.coverImage && product.coverImage) await fs.promises.unlink(`uploads/products/${product.coverImage}`);
      if (req.images && req.images.length > 0 && product.images && product.images.length > 0)
        await Promise.all(product.images.map(async (image) => await fs.promises.unlink(`uploads/products/${image}`)));
    }

    if (status === "deleting") {
      if (product.coverImage) await fs.promises.unlink(`uploads/products/${product.coverImage}`);
      if (product.images && product.images.length > 0)
        await Promise.all(product.images.map(async (image) => await fs.promises.unlink(`uploads/products/${image}`)));
    }
  });

/*
⚠️ Note: This implementation has a known limitation when UPDATING the `images` array.
If new images are sent in the request, all existing images will be deleted — even if only one image is sent.
Possible solutions include:
1. Sending the indexes of images to delete.
2. Sending the filenames of images to keep.
However, to keep this tutorial simple and focused, we will not handle these cases here.
*/

/*
💡 Tip: For better scalability and flexibility, consider moving image upload and processing logic to separate routes and controllers.
This approach offers:
1. Independent handling of image uploads, updates, and deletions.
2. Cleaner, modular code that's easier to maintain and extend.
*/

// =============================================================

exports.createProduct = factory.createDocument(ProductModel, { fieldToSlugify: "title", postTask: saveProductImages });

exports.getProducts = factory.getAllDocuments(ProductModel, { searchableFields: ["title", "description"] });

exports.getProduct = factory.getDocument(ProductModel);

exports.updateProduct = factory.updateDocument(ProductModel, {
  fieldToSlugify: "title",
  preTask: deleteProductImages("updating"),
  postTask: saveProductImages,
});

exports.deleteProduct = factory.deleteDocument(ProductModel, { preTask: deleteProductImages("deleting") });
