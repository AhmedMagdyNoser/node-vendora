const BrandModal = require("../models/brandModel");
const factory = require("../utils/factory");

exports.createBrand = factory.createDocument(BrandModal, { fieldToSlugify: "name" });

exports.getBrands = factory.getAllDocuments(BrandModal, { searchableFields: ["name"] });

exports.getBrand = factory.getDocument(BrandModal);

exports.updateBrand = factory.updateDocument(BrandModal, { fieldToSlugify: "name" });

exports.deleteBrand = factory.deleteDocument(BrandModal);
