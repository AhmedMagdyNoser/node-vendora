// Middleware to parse the cookies from the request headers and add them to the request object as req.cookies

module.exports = (req, res, next) => {
  req.cookies =
    req.headers.cookie?.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = decodeURIComponent(value); // Decode the cookie value
      return acc;
    }, {}) || {};
  next();
};
