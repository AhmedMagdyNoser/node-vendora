const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  // If there are errors, return a 400 status and the errors
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  // else, continue to the next middleware
  next();
};

// A limitation of express-validator is its inability to return appropriate HTTP status codes for certain validation scenarios — for instance, custom validators that detect resource conflicts still result in a 400 Bad Request instead of the more suitable 409 Conflict.
