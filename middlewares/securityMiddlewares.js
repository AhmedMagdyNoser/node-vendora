const mongoSanitize = require("express-mongo-sanitize");
const { rateLimit } = require("express-rate-limit");
const { xss } = require("express-xss-sanitizer");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes).
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

const applySecurityMiddlewares = (app) => {
  // Middleware to sanitize user input (in `req.body`, `req.query`, `req.headers` and `req.params`) to prevent NoSQL injection attacks. It searches for any keys in objects that begin with a `$` sign or contain a `.` and remove them completely.
  app.use(mongoSanitize());

  // Middleware to sanitize user input (in `req.body`, `req.query`, `req.headers` and `req.params`) to prevent Cross Site Scripting (XSS) attack by removing HTML tags and attributes from the input.
  app.use(xss());

  // Apply the rate limiting middleware to sensitive routes
  app.use("/auth/login", limiter);
  app.use("/auth/request-reset-code", limiter);
};

module.exports = applySecurityMiddlewares;
