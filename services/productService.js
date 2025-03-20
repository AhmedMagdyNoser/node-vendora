const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ProductModal = require("../models/productModel");
const ApiError = require("../utils/apiError");

exports.createProduct = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title, { lower: true });
  const product = await ProductModal.create(req.body);
  res.status(201).json({ data: product });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const products = await ProductModal.find().skip(skip).limit(limit);
  res.status(200).json({
    page,
    limit,
    results: products.length,
    data: products,
  });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductModal.findById(id);
  if (!product)
    return next(new ApiError(404, `Product not found with id: ${id}`));
  res.status(200).json({ data: product });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true });
  const product = await ProductModal.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!product)
    return next(new ApiError(404, `Product not found with id: ${id}`));
  res.status(200).json({ message: "Product updated", data: product });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductModal.findByIdAndDelete(id);
  if (!product)
    return next(new ApiError(404, `Product not found with id: ${id}`));
  res.status(204).send();
});
