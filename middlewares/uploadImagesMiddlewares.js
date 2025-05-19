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
 * Middleware to handle single image upload. The uploaded file will be available as `req.file`.
 *
 * Example `req.file`:
 * ```js
 * {
 *   fieldname: 'image',
 *   originalname: 'testImage.jpg',
 *   encoding: '7bit',
 *   mimetype: 'image/jpeg',
 *   buffer: <Buffer ...>,
 *   size: 16366
 * }
 * ```
 *
 * @param {string} fieldName - The name of the form field that holds the image file.
 * @returns {function} Express middleware for handling single image upload.
 */

exports.uploadSingleImage = (fieldName) => getMulterConfig().single(fieldName);

/**
 * Middleware to handle multiple image uploads under the same field. The uploaded files will be available as `req.files` (an array).
 *
 * Example `req.files`:
 * ```js
 * [
 *   {
 *     fieldname: 'images',
 *     originalname: 'testImage1.jpg',
 *     encoding: '7bit',
 *     mimetype: 'image/jpeg',
 *     buffer: <Buffer...>,
 *     size: 119318
 *   },
 *   {
 *     fieldname: 'images',
 *     originalname: 'testImage2.jpg',
 *     encoding: '7bit',
 *     mimetype: 'image/jpeg',
 *     buffer: <Buffer...>,
 *     size: 121304
 *   },
 *   {
 *     fieldname: 'images',
 *     originalname: 'testImage3.jpg',
 *     encoding: '7bit',
 *     mimetype: 'image/jpeg',
 *     buffer: <Buffer...>,
 *     size: 190998
 *   }
 * ]
 * ```
 *
 * @param {string} fieldName - The name of the form field that holds the image files.
 * @param {number} maxCount - The maximum number of files allowed for this field.
 * @returns {function} Express middleware for handling multiple image uploads.
 */

exports.uploadMultipleImages = (fieldName, maxCount) => getMulterConfig().array(fieldName, maxCount);

/**
 * Middleware to handle mixed file uploads for different fields.
 *
 * - Use when uploading a combination of single and multiple image fields.
 * - The uploaded files will be available in `req.files` as an object with field names as keys.
 *
 * Example `req.files`:
 * ```js
 * {
 *   coverImage: [
 *     {
 *       fieldname: 'coverImage',
 *       originalname: 'testCoverImage.jpg',
 *       encoding: '7bit',
 *       mimetype: 'image/jpeg',
 *       buffer: <Buffer...>,
 *       size: 16366
 *     }
 *   ],
 *   images: [
 *     {
 *       fieldname: 'images',
 *       originalname: 'testImage1.jpg',
 *       encoding: '7bit',
 *       mimetype: 'image/jpeg',
 *       buffer: <Buffer...>,
 *       size: 119318
 *     },
 *     {
 *       fieldname: 'images',
 *       originalname: 'testImage2.jpg',
 *       encoding: '7bit',
 *       mimetype: 'image/jpeg',
 *       buffer: <Buffer...>,
 *       size: 121304
 *     },
 *     {
 *       fieldname: 'images',
 *       originalname: 'testImage3.jpg',
 *       encoding: '7bit',
 *       mimetype: 'image/jpeg',
 *       buffer: <Buffer...>,
 *       size: 190998
 *     }
 *   ]
 * }
 * ```
 *
 * @param {Array<{name: string, maxCount: number}>} fields - An array of field definitions, each with a `name` and `maxCount`.
 * @returns {function} Express middleware for handling mixed image uploads.
 */

exports.uploadMixedImages = (fields) => getMulterConfig().fields(fields);
