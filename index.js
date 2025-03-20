const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/dbconnection");
const ApiError = require("./utils/apiError");

const categoryRoute = require("./routes/categoryRoute");
const subcategoryRoute = require("./routes/subcategoryRoute");
const brandRoute = require("./routes/brandRoute");
const productRoute = require("./routes/productRoute");

dotenv.config({ path: "./config.env" });

// Connect to MongoDB
connectDB();

// Create an Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to log requests in development mode
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Route handlers
app.get("/", (req, res) => res.send("App is running"));
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/subcategories", subcategoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/products", productRoute);

app.use("*", (req, res, next) => {
  next(new ApiError(404, `This route does not exist: ${req.originalUrl}`));
});

// Global error handler (A middleware with 4 parameters) (express will understand that this is the error handler)
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    statusCode: err.statusCode || 500,
    message: err.message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

// Start the server
const PORT = process.env.PORT || 5145;
const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Unhandled rejection: ${err}`);
  server.close(() => {
    console.log(`Shutting down the server due to unhandled promise rejection`);
    process.exit(1);
  });
});
