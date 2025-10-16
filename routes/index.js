const ApiError = require("../utils/apiError");

const categoryRoute = require("./categoryRoute");
const subcategoryRoute = require("./subcategoryRoute");
const brandRoute = require("./brandRoute");
const productRoute = require("./productRoute");
const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const profileRoute = require("./profileRoute");
const addressRoute = require("./addressRoute");
const wishlistRoute = require("./wishlistRoute");
const cartRoute = require("./cartRoute");
const reviewRoute = require("./reviewRoute");
const couponRoute = require("./couponRoute");
const orderRoute = require("./orderRoute");

module.exports = (app) => {
  // An endpoint to check if the server is running
  app.get("/", (req, res) => res.send(`App is running - ${new Date().toISOString()}`));

  // Mounting the routes
  app.use("/categories", categoryRoute);
  app.use("/subcategories", subcategoryRoute);
  app.use("/brands", brandRoute);
  app.use("/products", productRoute);
  app.use("/users", userRoute);
  app.use("/auth", authRoute);
  app.use("/profile", profileRoute);
  app.use("/addresses", addressRoute);
  app.use("/wishlist", wishlistRoute);
  app.use("/cart", cartRoute);
  app.use("/reviews", reviewRoute);
  app.use("/coupons", couponRoute);
  app.use("/orders", orderRoute);

  // Handle 404 errors for all other routes
  app.use("*", (req, res, next) => next(new ApiError(404, `This route does not exist: ${req.originalUrl}`)));
};
