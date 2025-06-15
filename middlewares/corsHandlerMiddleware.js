const cors = require("cors");

const whitelist = JSON.parse(process.env.WHITE_LIST || "[]");

module.exports = cors({
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) callback(null, true);
    else callback(new Error("The request origin is not allowed by the server's CORS policy."));
  },
  credentials: true, // Allows credentials (cookies, authorization headers, TLS client certificates) to be included in cross-origin requests.
});

// Why we use `!origin`?
// The `!origin` check allows requests that do not have an origin header, such as those made by certain server-side applications or tools (like Postman or curl).
