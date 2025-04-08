const { validationResult } = require("express-validator");

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  // If there are errors, return a 400 status and the errors
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  // else, continue to the next middleware
  next();
};

module.exports = validatorMiddleware;
