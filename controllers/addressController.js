const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

// We will not use the factory methods here as the addresses are a sub-document of the user model, and we need to access the user directly to manipulate addresses.

exports.addAddress = asyncHandler(async (req, res) => {
  const user = req.user;
  const { alias, city, details } = req.body;
  user.addresses.push({ alias, city, details });
  await user.save();
  res.status(201).json({ message: "Address added successfully.", data: user.addresses[user.addresses.length - 1] });
});

exports.getAddresses = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Addresses retrieved successfully.", data: req.user.addresses });
});

exports.getAddress = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const address = req.user.addresses.id(id);
  if (!address) return next(new ApiError(404, `The address with the ID \`${id}\` does not exist.`));
  res.status(200).json({ message: "Address retrieved successfully.", data: address });
});

exports.updateAddress = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const address = user.addresses.id(id);
  if (!address) return next(new ApiError(404, `The address with the ID \`${id}\` does not exist.`));
  const { alias, city, details } = req.body;
  address.alias = alias || address.alias;
  address.city = city || address.city;
  address.details = details || address.details;
  await user.save();
  res.status(200).json({ message: "Address updated successfully.", data: address });
});

exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const address = user.addresses.id(id);
  if (!address) return next(new ApiError(404, `The address with the ID \`${id}\` does not exist.`));
  address.deleteOne();
  await user.save();
  res.status(204).send();
});
