const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiQueryBuilder = require("../utils/apiQueryBuilder");
const ApiError = require("../utils/apiError");

const slugifyField = (request, fieldToSlugify) => {
  if (request.body[fieldToSlugify]) request.body.slug = slugify(request.body[fieldToSlugify], { lower: true });
};

exports.createDocument = (Model, options) =>
  asyncHandler(async (req, res) => {
    if (options?.fieldToSlugify) slugifyField(req, options.fieldToSlugify);
    const doc = await Model.create(req.body);
    res.status(201).json({ message: "Document created successfully.", data: doc });
  });

exports.getAllDocuments = (Model, options) =>
  asyncHandler(async (req, res) => {
    const apiQueryBuilder = new ApiQueryBuilder(Model, req.query).filter(); // Filter documents based on query parameters
    if (options?.searchableFields) apiQueryBuilder.search(...options.searchableFields); // Search documents based on `keyword` query parameter
    await apiQueryBuilder.countFilteredDocuments(); // Count the number of documents after applying filters (for pagination)
    apiQueryBuilder.paginate().sort().limitFields(); // Paginate the results, and allow sorting and limiting fields
    const documents = await apiQueryBuilder.mongooseQuery; // Execute the query
    res.status(200).json({
      results: documents.length,
      pagination: apiQueryBuilder.pagination,
      data: documents,
    });
  });

exports.getDocument = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findById(id);
    if (!doc) return next(new ApiError(404, `Document with ID: \`${id}\` does not exist.`));
    res.status(200).json({ message: "Document retrieved successfully.", data: doc });
  });

exports.updateDocument = (Model, options) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (options?.fieldToSlugify) slugifyField(req, options.fieldToSlugify);
    const doc = await Model.findByIdAndUpdate(id, req.body, { new: true });
    if (!doc) return next(new ApiError(404, `Document with ID: \`${id}\` does not exist.`));
    res.status(200).json({ message: "Document updated successfully.", data: doc });
  });

exports.deleteDocument = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) return next(new ApiError(404, `Document with ID: \`${id}\` does not exist.`));
    res.status(204).send();
  });
