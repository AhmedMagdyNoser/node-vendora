const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiQueryBuilder = require("./apiQueryBuilder");
const ApiError = require("./apiError");

const slugifyField = (req, fieldToSlugify) => {
  if (req.body[fieldToSlugify]) req.body.slug = slugify(req.body[fieldToSlugify], { lower: true });
};

const notFoundMsg = (id) => `Document with ID: \`${id}\` does not exist.`;

// =============================================================

/**
 * Creates a new document in the database.
 * @param {mongoose.Model} Model - The Mongoose model to create the document from.
 * @param {Object} options - Optional settings.
 * @param {string} [options.fieldToSlugify] - Field name to generate a `slug` from.
 * @param {Function} [options.preTask] - Async function to run before creating `async (req, res, next)`.
 * @param {Function} [options.postTask] - Async function to run after creating `async (req, res, next, doc)`.
 * @param {string} [options.populate] - Fields to populate after creation.
 */

exports.createDocument = (Model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    if (options.fieldToSlugify) slugifyField(req, options.fieldToSlugify);
    if (options.preTask) await options.preTask(req, res, next);
    let document = await Model.create(req.body);
    if (options.populate) document = await Model.findById(document._id).populate(options.populate);
    if (options.postTask) await options.postTask(req, res, next, document);
    res.status(201).json({ message: "Document created successfully.", data: document });
  });

// -------------------------------------------------------------

/**
 * Retrieves all documents from the database.
 * @param {mongoose.Model} Model - The Mongoose model to retrieve documents from.
 * @param {Object} options - Optional settings.
 * @param {string[]} [options.searchableFields] - Fields to search in.
 * @param {string} [options.populate] - Fields to populate.
 */

exports.getAllDocuments = (Model, options = {}) =>
  asyncHandler(async (req, res) => {
    const pagination = req.query.limit !== "Infinity";
    const apiQueryBuilder = new ApiQueryBuilder(Model, req.query).filter(); // Filter documents based on query parameters
    if (options.searchableFields) apiQueryBuilder.search(...options.searchableFields); // Search documents based on `keyword` query parameter
    if (options.populate) apiQueryBuilder.populate(options.populate); // Populate specified fields
    if (pagination) {
      await apiQueryBuilder.countFilteredDocuments(); // Count the number of documents after applying filters and search (for pagination)
      apiQueryBuilder.paginate().sort().limitFields(); // Paginate the results, and allow sorting and limiting fields
    } else apiQueryBuilder.sort().limitFields(); // Only sort and limit fields if pagination is not required
    const documents = await apiQueryBuilder.mongooseQuery; // Execute the query
    res.status(200).json({
      results: documents.length,
      ...(pagination ? { pagination: apiQueryBuilder.pagination } : {}),
      data: documents,
    });
  });

// -------------------------------------------------------------

/**
 * Retrieves a single document by its ID from the database.
 * @param {mongoose.Model} Model - The Mongoose model to retrieve the document from.
 * @param {Object} options - Optional settings.
 * @param {string} [options.populate] - Fields to populate.
 */

exports.getDocument = (Model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (options.populate) query = query.populate(options.populate);
    const document = await query;
    if (!document) return next(new ApiError(404, notFoundMsg(id)));
    res.status(200).json({ message: "Document retrieved successfully.", data: document });
  });

// -------------------------------------------------------------

/**
 * Updates a document by its ID in the database.
 * @param {mongoose.Model} Model - The Mongoose model to update the document from.
 * @param {Object} options - Optional settings.
 * @param {string} [options.fieldToSlugify] - Field name to generate a `slug` from.
 * @param {Function} [options.preTask] - Async function to run before updating `async (req, res, next, doc)`.
 * @param {Function} [options.postTask] - Async function to run after updating `async (req, res, next, doc)`.
 * @param {string} [options.populate] - Fields to populate after updating.
 */

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
    if (options.populate) document = await Model.findById(document._id).populate(options.populate);
    if (options.postTask) await options.postTask(req, res, next, document);
    res.status(200).json({ message: "Document updated successfully.", data: document });
  });

// -------------------------------------------------------------

/**
 * Deletes a document by its ID from the database.
 * @param {mongoose.Model} Model - The Mongoose model to delete the document from.
 * @param {Object} options - Optional settings.
 * @param {Function} [options.preTask] - Async function to run before deleting `async (req, res, next, doc)`.
 */

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
