const factory = require("../utils/factory");
const CategoryModel = require("../models/categoryModel");

exports.createCategory = factory.createDocument(CategoryModel, { fieldToSlugify: "title" });

exports.getCategories = factory.getAllDocuments(CategoryModel, { searchableFields: ["title"] });

exports.getCategory = factory.getDocument(CategoryModel);

exports.updateCategory = factory.updateDocument(CategoryModel, { fieldToSlugify: "title" });

exports.deleteCategory = factory.deleteDocument(CategoryModel);
