const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiQueryBuilder = require("./apiQueryBuilder");
const ApiError = require("./apiError");

const slugifyField = (req, fieldToSlugify) => {
  if (req.body[fieldToSlugify]) req.body.slug = slugify(req.body[fieldToSlugify], { lower: true });
};

const notFoundMsg = (id) => `Document with ID: \`${id}\` does not exist.`;

// =============================================================

exports.createDocument = (Model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    if (options.fieldToSlugify) slugifyField(req, options.fieldToSlugify);
    if (options.preTask) await options.preTask(req, res, next);
    const document = await Model.create(req.body);
    if (options.postTask) await options.postTask(req, res, next, document);
    res.status(201).json({ message: "Document created successfully.", data: document });
  });

exports.getAllDocuments = (Model, options = {}) =>
  asyncHandler(async (req, res) => {
    const apiQueryBuilder = new ApiQueryBuilder(Model, req.query).filter(); // Filter documents based on query parameters
    if (options.searchableFields) apiQueryBuilder.search(...options.searchableFields); // Search documents based on `keyword` query parameter
    await apiQueryBuilder.countFilteredDocuments(); // Count the number of documents after applying filters and search (for pagination)
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
    const document = await Model.findById(id);
    if (!document) return next(new ApiError(404, notFoundMsg(id)));
    res.status(200).json({ message: "Document retrieved successfully.", data: document });
  });

exports.updateDocument = (Model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (options.fieldToSlugify) slugifyField(req, options.fieldToSlugify);
    let document; // The document to be updated
    if (options.preTask) {
      document = await Model.findById(id);
      if (!document) return next(new ApiError(404, notFoundMsg(id)));
      await options.preTask(req, res, next, document);
      document = await Model.findByIdAndUpdate(id, req.body, { new: true });
    } else {
      document = await Model.findByIdAndUpdate(id, req.body, { new: true });
      if (!document) return next(new ApiError(404, notFoundMsg(id)));
    }
    if (options.postTask) await options.postTask(req, res, next, document);
    res.status(200).json({ message: "Document updated successfully.", data: document });
  });

exports.deleteDocument = (Model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let document; // The document to be deleted
    if (options.preTask) {
      document = await Model.findById(id);
      if (!document) return next(new ApiError(404, notFoundMsg(id)));
      await options.preTask(req, res, next, document);
      document = await Model.findByIdAndDelete(id);
    } else {
      document = await Model.findByIdAndDelete(id);
      if (!document) return next(new ApiError(404, notFoundMsg(id)));
    }
    res.status(204).send();
  });
