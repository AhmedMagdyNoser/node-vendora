const multer = require("multer");
const ApiError = require("../utils/apiError");

/**
 * Returns a configured Multer instance for handling image uploads.
 * - Uses memory storage (stores files in memory as Buffers).
 * - Filters files to allow only images.
 *
 * @returns {multer.Instance} A configured Multer instance.
 */

const getMulterConfig = () =>
  multer({
    // Store files in memory as Buffer objects
    storage: multer.memoryStorage(),
    // Filter files to only accept image files
    fileFilter: (req, file, callback) => {
      if (file.mimetype.startsWith("image"))
        callback(null, true); // `null` means no error.
      else callback(new ApiError(400, "Not an image! Please upload only images."), false);
    },
  });

/**
 * Returns a single-file upload middleware.
 *
 * @param {string} fieldName - The name of the form field that holds the image file.
 * @returns {function} Express middleware for handling single image uploads.
 */

exports.uploadSingleImage = (fieldName) => getMulterConfig().single(fieldName);

/**
 * Returns a multiple-file upload middleware.
 *
 * @param {string} fieldName - The name of the form field that holds the image files.
 * @param {number} maxCount - The maximum number of files allowed for this field.
 * @returns {function} Express middleware for handling multiple image uploads.
 */

exports.uploadMultipleImages = (fieldName, maxCount) => getMulterConfig().array(fieldName, maxCount);

/**
 * Returns a middleware for handling mixed single and multiple file uploads.
 *
 * @param {Array} fields - An array of objects specifying the fields for mixed single and multiple file uploads.
 * @returns {function} Express middleware for handling mixed single and multiple file uploads.
 */

exports.uploadMixedImages = (fields) => getMulterConfig().fields(fields);
