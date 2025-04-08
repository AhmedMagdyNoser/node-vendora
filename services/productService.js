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
  // Declaring the mongoose query
  const mongooseQuery = ProductModal.find();

  // 1 - Handling filtering + Handling filtring using [gt, gte, lt, lte]
  // Copying the query object (to avoid mutating the original request object)
  const queryObj = JSON.parse(JSON.stringify(req.query));
  // Removing specific fields from the query object
  ["keyword", "page", "limit", "sort", "fields"].forEach((excludedField) => delete queryObj[excludedField]);
  // The request is sent like: /products?rating=5&price[gt]=100
  // The query object will be like: { rating: 5, price: { gt: 100 } }
  // We need to convert it to: { rating: 5, price: { $gt: 100 } }
  mongooseQuery.find(JSON.parse(JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`))); // gt -> $gt, gte -> $gte, lt -> $lt, lte -> $lte

  // 2 - Searching (For example: /products?keyword=apple)
  if (req.query.keyword) {
    mongooseQuery.find({
      $or: [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ],
    });
  }

  // 3 - Pagination (For example: /products?page=1&limit=25)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  mongooseQuery.skip(skip).limit(limit);

  // 4 - Sorting (For example: /products?sort=price)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery.sort("-createdAt"); // Default sorting by createdAt field in descending order
  }

  // 5 - Field limiting (For example: /products?fields=title,price)
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery.select(fields);
  }

  // Excuting the query
  const products = await mongooseQuery;

  res.status(200).json({ page, limit, results: products.length, data: products });
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
