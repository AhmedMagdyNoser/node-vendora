const multer = require("multer");
const ApiError = require("../utils/apiError");

/**
 * Middleware to handle multipart/form-data single image upload using Multer.
 *
 * This function returns a Multer middleware that:
 * - Uses **memory storage** to store uploaded files as Buffer objects in memory.
 * - Filters uploads to only accept image files based on MIME type.
 *
 * @function
 * @param {string} fieldName - The name of the form field that holds the image file.
 * @returns {function} Express middleware for handling single image uploads.
 *
 */

const uploadSingleImage = (fieldName) => {
  // The memory storage object stores the files in memory as Buffer objects.
  const multerStorage = multer.memoryStorage();

  // The file filter function is used to filter the files that are uploaded.
  const multerFilter = (req, file, callback) => {
    if (file.mimetype.startsWith("image"))
      callback(null, true); // `null` means no error.
    else callback(new ApiError(400, "Not an image! Please upload only images."), false);
  };

  return multer({ storage: multerStorage, fileFilter: multerFilter }).single(fieldName);
};

module.exports = uploadSingleImage;
