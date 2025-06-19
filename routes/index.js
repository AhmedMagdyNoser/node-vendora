const ApiError = require("../utils/apiError");

const categoryRoute = require("./categoryRoute");
const subcategoryRoute = require("./subcategoryRoute");
const brandRoute = require("./brandRoute");
const productRoute = require("./productRoute");
const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const profileRoute = require("./profileRoute");
const wishlistRoute = require("./wishlistRoute");
const reviewRoute = require("./reviewRoute");

module.exports = (app) => {
  // An endpoint to check if the server is running
  app.get("/", (req, res) => res.send("App is running"));

  // Mounting the routes
  app.use("/categories", categoryRoute);
  app.use("/subcategories", subcategoryRoute);
  app.use("/brands", brandRoute);
  app.use("/products", productRoute);
  app.use("/users", userRoute);
  app.use("/auth", authRoute);
  app.use("/profile", profileRoute);
  app.use("/wishlist", wishlistRoute);
  app.use("/reviews", reviewRoute);

  // Handle 404 errors for all other routes
  app.use("*", (req, res, next) => next(new ApiError(404, `This route does not exist: ${req.originalUrl}`)));
};
