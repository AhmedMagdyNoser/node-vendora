// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const mountRoutes = require("./routes");
const connectToDatabase = require("./config/db");
const globalErrorHandler = require("./middlewares/errorHandlerMiddleware");

// Connect to MongoDB
connectToDatabase();

// Create an Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to serve static files from the "uploads" directory
app.use(express.static("uploads"));

// Middleware to log requests
app.use(morgan("dev"));

// Route handlers
mountRoutes(app);

// Middleware to handle global errors
app.use(globalErrorHandler);

// Start the server
const PORT = process.env.PORT || 5145;
const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Unhandled rejection: ${err}`);
  server.close(() => {
    console.log(`Shutting down the server due to unhandled promise rejection`);
    process.exit(1);
  });
});
