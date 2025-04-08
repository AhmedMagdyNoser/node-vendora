const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const BrandModal = require("../models/brandModel");
const ApiError = require("../utils/apiError");

exports.createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name, { lower: true });
  const brand = await BrandModal.create({ name, slug });
  res.status(201).json({ data: brand });
});

exports.getBrands = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const brands = await BrandModal.find().skip(skip).limit(limit);
  res.status(200).json({
    page,
    limit,
    results: brands.length,
    data: brands,
  });
});

exports.getBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await BrandModal.findById(id);
  if (!brand) return next(new ApiError(404, `Brand not found with id: ${id}`));
  res.status(200).json({ data: brand });
});

exports.updateBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const slug = slugify(name, { lower: true });
  const brand = await BrandModal.findByIdAndUpdate(id, { name, slug }, { new: true });
  if (!brand) return next(new ApiError(404, `Brand not found with id: ${id}`));
  res.status(200).json({ message: "Brand updated", data: brand });
});

exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await BrandModal.findByIdAndDelete(id);
  if (!brand) return next(new ApiError(404, `Brand not found with id: ${id}`));
  res.status(204).send();
});
