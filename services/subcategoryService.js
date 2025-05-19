const factory = require("../utils/factory");
const SubcategoryModel = require("../models/subcategoryModel");

exports.createSubcategory = factory.createDocument(SubcategoryModel, { fieldToSlugify: "title" });

exports.getSubcategories = factory.getAllDocuments(SubcategoryModel, { searchableFields: ["title"] });

exports.getSubcategory = factory.getDocument(SubcategoryModel);

exports.updateSubcategory = factory.updateDocument(SubcategoryModel, { fieldToSlugify: "title" });

exports.deleteSubcategory = factory.deleteDocument(SubcategoryModel);
