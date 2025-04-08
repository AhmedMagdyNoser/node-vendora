const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ProductModal = require("../models/productModel");
const ApiError = require("../utils/apiError");
const ApiQueryBuilder = require("../utils/apiQueryBuilder");

exports.createProduct = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title, { lower: true });
  const product = await ProductModal.create(req.body);
  res.status(201).json({ data: product });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const apiQueryBuilder = new ApiQueryBuilder(ProductModal, req.query).filter().search("title", "description");
  await apiQueryBuilder.countFilteredDocuments(); // Count the number of documents after applying filters (for pagination)
  apiQueryBuilder.paginate().sort().limitFields();
  const products = await apiQueryBuilder.mongooseQuery;
  res.status(200).json({
    results: products.length,
    pagination: apiQueryBuilder.pagination,
    data: products,
  });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductModal.findById(id);
  if (!product) return next(new ApiError(404, `Product not found with id: ${id}`));
  res.status(200).json({ data: product });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true });
  const product = await ProductModal.findByIdAndUpdate(id, req.body, { new: true });
  if (!product) return next(new ApiError(404, `Product not found with id: ${id}`));
  res.status(200).json({ message: "Product updated", data: product });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductModal.findByIdAndDelete(id);
  if (!product) return next(new ApiError(404, `Product not found with id: ${id}`));
  res.status(204).send();
});
