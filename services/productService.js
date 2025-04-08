const ProductModal = require("../models/productModel");
const factory = require("../utils/factory");

exports.createProduct = factory.createDocument(ProductModal, { fieldToSlugify: "title" });

exports.getProducts = factory.getAllDocuments(ProductModal, { searchableFields: ["title", "description"] });

exports.getProduct = factory.getDocument(ProductModal);

exports.updateProduct = factory.updateDocument(ProductModal, { fieldToSlugify: "title" });

exports.deleteProduct = factory.deleteDocument(ProductModal);
