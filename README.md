# Node.js Express API Blueprint

Before we begin, please note the following:

> In this tutorial, we’ll use CommonJS modules, but feel free to use ES Modules instead. ES Modules are the modern standard, while CommonJS remains the legacy default in Node.js.

> In some sections, you might need to refer to the original project code or official documentation for a deeper understanding.

---

## Initialize Your Node.js & Express App

Begin by creating a new folder for your project and navigating into it. Then, initialize a new Node.js project with the following command:

```bash
npm init -y
```

The `-y` flag automatically accepts all default settings, generating a `package.json` file that manages your project's dependencies and configurations.

Next, install **Express**, the minimalist web framework for Node.js:

```bash
npm install express
```

Now, create a file named `index.js` in the root of your project and set up a basic Express server:

```js
const express = require("express");
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.get("/", (req, res) => res.send("Hello World!")); // API endpoint
app.listen(5145, () => console.log("Server is running on port 5145"));
```

To run the server, use:

```bash
node index.js
```

You should see the message `Server is running on port 5145` in your terminal, and visiting `http://localhost:5145` in your browser will display “Hello World!”.

---

## Environment Variables Setup

1. Create a `.env` file in the root directory (and ignore it in `.gitignore`) and add the following content:

```
PORT=5145
```

2. Install `dotenv` to read environment variables from the `.env` file:

```bash
npm install dotenv
```

3. Load environment variables in `index.js` by adding the following:

```js
require("dotenv").config(); // This loads the variables from .env file into process.env
const PORT = process.env.PORT || 5145;
```

By using environment variables, you make your app more flexible and secure across different environments.

---

## Nodemon & Scripts

To enable automatic server restarts during development, follow these steps:

1. Install `nodemon` - as a development dependency - to watch for file changes and restart the server automatically:

```bash
npm install --save-dev nodemon
```

2. Install `cross-env` - as a development dependency - to set environment variables across different platforms (useful for cross-platform compatibility):

```bash
npm install --save-dev cross-env
```

3. Update `package.json` by adding the following scripts for development and production environments:

```json
"scripts": {
  "dev": "cross-env ENVIRONMENT=development nodemon index.js",
  "start": "cross-env ENVIRONMENT=production node index.js"
}
```

Here, the command `cross-env ENVIRONMENT=development nodemon index.js` sets the `ENVIRONMENT` variable to `development` and starts the server with Nodemon. This environment variable can later be used to customize behavior based on whether you're running in a development or production environment.

4. Start the server in development mode by running:

```bash
npm run dev
```

Now, the server will automatically restart on changes, making development smoother and faster.

---

## Logging with Morgan

Let’s make your server a little chatty with some request logging!

1. First, install **morgan**:

```bash
npm install morgan
```

2. Then, tell your server to use **morgan** as middleware to log requests. It’ll print details in the console.

```js
const morgan = require("morgan");
app.use(morgan("dev")); // "dev" is a predefined format for logging
```

Now, every request will get a nice little log. Perfect for debugging and knowing exactly what's happening at all times!

---

## Database Connection with Mongoose

```bash
npm install mongoose
```

Create a connection function for better organization in `config/db.js`:

```js
const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.DB_URI); // Add Database URI to .env
    console.log("DB Connected");
  } catch (err) {
    console.error(`DB Connection Error: ${err}`);
  }
};
```

Import this function into `index.js` and run it to establish the connection:

```js
const connectToDatabse = require("./config/db");
connectToDatabse();
```

This way, your app will connect to MongoDB and let you know if it’s all set or if something went wrong.

---

## Creating a Model with CRUD Endpoints

```js
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
});

const CategoryModel = mongoose.model("Category", categorySchema);

// -----

// Create a new category (POST /categories)
app.post("/categories", async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await CategoryModel.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to create category." });
  }
});

// Get all categories (GET /categories)
app.get("/categories", async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories." });
  }
});

// Get one category by ID (GET /categories/:id)
app.get("/categories/:id", async (req, res) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch category." });
  }
});

// Update a category by ID (PUT /categories/:id)
app.put("/categories/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await CategoryModel.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to update category." });
  }
});

// Delete a category by ID (DELETE /categories/:id)
app.delete("/categories/:id", async (req, res) => {
  try {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.status(204).json({ message: "Category deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category." });
  }
});
```

### Pagination

To implement pagination, you can modify the `GET /categories` endpoint to accept `page` and `limit` query parameters. Here's how you can do it:

```js
// Get all categories with pagination (GET /categories?page=1&limit=10)
app.get("/categories", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const categories = await CategoryModel.find().skip(skip).limit(limit);
    res.status(200).json({ page, limit, data: categories });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories." });
  }
});
```

---

## Project Structure

We’ll adopt a structured and modular project layout. The following directories will be created in the root of the project for a scalable and maintainable API:

- `models` – Contains all database schemas and Mongoose models that define how data is structured and stored.
- `routes` – Defines all application endpoints and maps them to their corresponding functions.
- `validators` – Includes logic for validating incoming request data to ensure consistency and security.
- `controllers` – Handle the main logic for processing requests, interacting with models, and sending appropriate responses.

While additional directories like `middlewares`, `utils`, and `config` are also common in a well-structured app, the above folders form the core foundation for organizing all API-related code.

---

## Express Validator

We’ll use **express-validator** to check and clean user input in our API.

```bash
npm install express-validator
```

Inside the `validators` folder, create separate files to add validation rules for each route.

Also, add a middleware (e.g., `middlewares/validatorMiddleware.js`) to handle any validation errors and send a clear response if the input is invalid.

### Common Validation Rules

1. General Strings

   - `trim()` - Or remove it if not needed
   - `notEmpty().withMessage("...")`
   - `isLength({ min: X, max: Y }).withMessage("...")` - If length is important

2. Emails

   - `trim()`
   - `notEmpty().withMessage("...")`
   - `toLowerCase()`
   - `isEmail().withMessage("...")`

3. Phone numbers

   - `trim()`
   - `notEmpty().withMessage("...")`
   - `isMobilePhone("...").withMessage("...")`

4. Passwords

   - `notEmpty().withMessage("...")`
   - `isStrongPassword({ ... }).withMessage("...")` - If you want to enforce a strong password policy

5. Mongo IDs

   - `notEmpty().withMessage("...")`
   - `isMongoId().withMessage("...")`

6. Numbers

   - `notEmpty().withMessage("...")`
   - `isNumeric().withMessage("...")`
   - `isInt().withMessage("...")` - If it should be an integer
   - `isInt({ min: X, max: Y }).withMessage("...")` - For integer ranges
   - `isFloat({ min: X, max: Y }).withMessage("...")` - For float ranges

7. Arrays

   - `notEmpty().withMessage("...")`
   - `isArray().withMessage("...")`
   - `isArray({ min: X, max: Y }).withMessage("...")` - For array length

### Optional Fields

When a field isn’t required, prefix its validation chain with `optional()`. This tells **express-validator** to skip all subsequent checks for that field if its value is `undefined` or missing from the request. In this case:

- You can **remove** `notEmpty().withMessage()` entirely.

- For **optional general strings**, you can:

  - **Keep** `notEmpty().withMessage()` but rephrase the message to be more user-friendly (e.g., `"Title cannot be an empty string"` instead of `"Title is required"`),
  - Or **remove** `notEmpty().withMessage()` if empty strings are acceptable.

This keeps your validations both flexible and clear.

### Short-circuiting with `bail()`

Always follow a `.withMessage()` call with `.bail()`. If a validation rule fails, `bail()` immediately stops further checks on that field. This prevents multiple error messages for the same problem and speeds up your validation pipeline.

### Custom Validation Logic

For complex or asynchronous rules - like enforcing uniqueness - you can use `.custom()`. The callback receives the field’s value and a meta object (that includes `req` object), so you can query your database or perform any logic:

When using custom validators to check conflicting values, You may need to use the operator `$ne` (not equal) to exclude the current document's ID from the search. This is useful when you want to check for uniqueness while allowing updates to the same document.

```js
.custom(async (email, { req }) => {
  const user = await UserModel.findOne({ email, _id: { $ne: req.params.id } });
  if (user) throw new Error("User with this email already exists.");
}),
```

### `express-validator` Limitations

A limitation of express-validator is its inability to return appropriate HTTP status codes for certain validation scenarios — for instance, custom validators that detect resource conflicts still result in a 400 Bad Request instead of the more suitable 409 Conflict.

---

## Error Handling & Async Handler

In `middlewares/errorMiddleware.js`, we created a centralized error handler middleware that manages all errors in one place, and it’s imported in `index.js`.

We also made a custom error class `ApiError` in `utils/apiError.js` to better organize our error structure.

### Here are different ways to handle errors:

1. **Sending the error directly inside a `try/catch`:**

```js
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: `Category not found.` });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: `Error deleting category: ${err}.` });
  }
};
```

2. **Passing the error to the global error handler using `next`:**

```js
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) return next(new Error(`Category not found.`));
    res.status(204).send();
  } catch (err) {
    next(new Error(`Error deleting category: ${err}.`));
  }
};
```

3. **Using the `ApiError` class for better error organization:**

```js
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) return next(new ApiError(404, `Category not found.`));
    res.status(204).send();
  } catch (err) {
    next(new ApiError(500, `Error deleting category: ${err}.`));
  }
};
```

4. **Using `express-async-handler` to avoid explicit `try/catch` blocks, combined with the `ApiError` class:**

First, install the package:

```bash
npm i express-async-handler
```

```js
const asyncHandler = require("express-async-handler");

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await CategoryModel.findByIdAndDelete(req.params.id);
  if (!category) return next(new ApiError(404, `Category not found.`));
  res.status(204).send();
});
```

This last approach keeps your code clean and simple, while ensuring all errors are passed smoothly to the centralized error handler for consistent processing.

---

## Linting with ESLint

**ESLint** is a tool that checks your JavaScript code for errors and helps you follow best practices. It makes your code cleaner, more consistent, and easier to maintain.

```bash
npm install --save-dev eslint @eslint/js eslint-plugin-n
```

And then create a `eslint.config.js` file in the root of your project and add the rules you want to enforce.

Then, inside your `package.json`, add this under the scripts section:

```json
  "lint": "eslint ."
```

Use this command to check your code for problems:

```bash
npm run lint
```

For real-time error checking as you type, install the official [**ESLint extension for VS Code**](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

---

## Formatting with Prettier

**Prettier** is a code formatter that automatically formats your code so it's neat, consistent, and easy to read—no more arguing over spaces vs tabs!

```bash
npm install --save-dev prettier
```

Create a `.prettierrc` file in the root of your project to customize how Prettier formats your code.

Want Prettier to run automatically on save? Install the **Prettier VS Code extension** and enable “Format on Save” in your settings.

---

## Population in Mongoose

Sometimes, we store references to other documents using `ObjectId`s. But when we actually want the full data from the referenced document, we use **`populate()`**—which is like performing a `JOIN` in SQL.

> Keep in mind: `populate()` triggers an extra query to the database, which can affect performance if overused.

### Example: Subcategory and its Parent Category

1. Without population: returns category as an ID

```js
exports.getSubcategories = asyncHandler(async (req, res) => {
  const subcategories = await SubcategoryModel.find();
  res.status(200).json(subcategories);
});
```

2. With population: replaces category ID with full category document

```js
exports.getSubcategories = asyncHandler(async (req, res) => {
  const subcategories = await SubcategoryModel.find().populate("category"); // "category" is the field name in the subcategory model
  res.status(200).json(subcategories);
});
```

3. Populate and select specific fields from the related category

```js
exports.getSubcategories = asyncHandler(async (req, res) => {
  const subcategories = await SubcategoryModel.find().populate({ path: "category", select: "title description" });
  res.status(200).json(subcategories);
});
```

4. Exclude specific fields from the populated data

```js
exports.getSubcategories = asyncHandler(async (req, res) => {
  const subcategories = await SubcategoryModel.find().populate({ path: "category", select: "title description -_id" });
  res.status(200).json(subcategories);
});
```

Another approach to populate is to use **Mongoose middleware** in the `models/subcategoryModel.js` file:

```js
// Populate the category field before executing any `find` query (like find, findOne, findAndUpdate, etc.)
subcategorySchema.pre(/^find/, function (next) {
  this.populate("category"); // `this` refers to the current query.
  next();
});
```

However, this approach is not recommended, as it often lacks sufficient control, flexibility to accommodate various scenarios, and maintainability.

---

## Retrieval with Filtring, Searching, Pagination, Sorting, and Limiting Fields

```js
exports.getProducts = asyncHandler(async (req, res) => {
  // Declaring the mongoose query
  const mongooseQuery = ProductModel.find();

  // 1 - Handling filtering + Handling filtring using [gt, gte, lt, lte]
  // Copying the query object (to avoid mutating the original request object)
  const queryObj = JSON.parse(JSON.stringify(req.query));
  // Removing specific fields from the query object
  ["keyword", "page", "limit", "sort", "fields"].forEach((excludedField) => delete queryObj[excludedField]);
  // The request is sent like: /products?rating=5&price[gt]=100
  // The query object will be like: { rating: 5, price: { gt: 100 } }
  // We need to convert it to: { rating: 5, price: { $gt: 100 } }
  mongooseQuery.find(JSON.parse(JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`))); // gt -> $gt, gte -> $gte, lt -> $lt, lte -> $lte

  // 2 - Searching (For example: /products?keyword=apple)
  if (req.query.keyword) {
    mongooseQuery.find({
      $or: [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ],
    });
  }

  // 3 - Pagination (For example: /products?page=1&limit=25)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  mongooseQuery.skip(skip).limit(limit);

  // 4 - Sorting (For example: /products?sort=price)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery.sort("-createdAt"); // Default sorting by createdAt field in descending order
  }

  // 5 - Field limiting (For example: /products?fields=title,price)
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery.select(fields);
  }

  // Excuting the query
  const products = await mongooseQuery;

  res.status(200).json({ page, limit, results: products.length, data: products });
});
```

For reusability, we can create a class that encapsulates these functionalities, making it easy to apply them across multiple models.

Take a look at `utils/apiQueryBuilder` — you’ll notice that we’ve also added extra logic to make the search functionality more flexible, included pagination details, and implemented additional logic for population.

Here's how this class can be used:

```js
exports.getProducts = asyncHandler(async (req, res) => {
  const apiQueryBuilder = new ApiQueryBuilder(ProductModel, req.query).filter().search("title", "description");
  await apiQueryBuilder.countFilteredDocuments(); // Count the number of documents after applying filters (for pagination)
  apiQueryBuilder.paginate().sort().limitFields();
  const products = await apiQueryBuilder.mongooseQuery;
  res.status(200).json({
    results: products.length,
    pagination: apiQueryBuilder.pagination,
    data: products,
  });
});
```

---

## Factory Handlers

You'll likely notice that much of the logic is repetitive. To improve **reusability** and maintain **cleaner code**, we can extract the shared logic into a centralized factory.

Take a look at `utils/factory.js` to see how this approach works.

### Additional Notes

- **Clean the Request Body:**
  Before calling factory `create` or `update` handlers, make sure to sanitize the body using a middleware. This prevents users from setting sensitive or computed fields (e.g., `sold`, `rating`, `ratingsCount` for products) manually, preserving data integrity.

- **Soft Deletes for Referenced Documents:**
  When a document is referenced in other collections, avoid hard deletion. Instead, add an `isDeleted` flag to mark the document as deleted. This allows you to safely exclude it from queries while avoiding broken references. This approach is not implemented in this tutorial, but it's **highly recommended**.

---

## Handling Files

To handle file uploads in Node.js, we’ll use a middleware called [`multer`](https://github.com/expressjs/multer). It's specifically designed for handling `multipart/form-data`, which is the format used when submitting forms that include files.

```bash
npm i multer
```

Basic usage example:

```js
const multer = require("multer");

// Creating a middleware to handle file uploads
const upload = multer({ dest: "uploads" }); // Files will be stored in the 'uploads' directory

// Add this middleware before route handlers to handle file uploads

// Upload a single file (field name: "avatar" in a form-data)
app.post("/profile", upload.single("avatar"), (req, res) => {
  console.log(req.file); // Uploaded file info (e.g., filename, path, mimetype, size)
  console.log(req.body); // Other form fields
  res.send("File uploaded successfully!");
});

// Upload multiple files (field name: "photos" in a form-data)
app.post("/album", upload.array("photos", 12), (req, res) => {
  console.log(req.files); // Array of uploaded files
  console.log(req.body); // Other form fields
  res.send("Files uploaded successfully!");
});
```

---

## Handling Files with Disk Storage

While the default `multer` setup is useful, we often need more control. For that, we’ll use `multer`'s **disk storage engine** along with some organized configuration.

For example, in the brand contorller, you may define a custom upload middleware:

```js
// The disk storage object gives you full control on storing files to disk.
const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, "uploads/brands"), // `null` means no error.
  filename: (req, file, callback) => {
    const extension = file.mimetype.split("/")[1];
    const name = `brand-${req.body.name.toLowerCase()}-${Date.now()}.${extension}`;
    req.body.image = name; // Save the file name to the request body to be saved in the database.
    callback(null, name); // `null` means no error.
  },
});

// Filter to allow only image files
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image"))
    callback(null, true); // `null` means no error.
  else callback(new ApiError(400, "Not an image! Please upload only images."), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Exporting middleware for single image upload (expects a field named "image")
exports.uploadBrandImage = upload.single("image");
```

Then use the middleware like this:

```js
router.post("/", uploadBrandImage, createBrandValidator, createBrand);
```

But what if we want to **compress**, **resize**, or apply other processing to the image?

To do so, we’ll need to process the image **in memory** first. This can be achieved by switching to `memoryStorage` and integrating image processing tools like `sharp`.

---

## Handling Files with Memory Storage

To allow image processing (e.g. resizing, compression), we’ll use `multer.memoryStorage()` instead of `diskStorage`. This stores the uploaded file **temporarily in memory** as a buffer, which we can then process using libraries like [`sharp`](https://github.com/lovell/sharp).

```bash
npm i sharp
```

Update the upload middleware and create image processing middleware

```js
// The memory storage object stores the files in memory as Buffer objects.
const multerStorage = multer.memoryStorage();

// The file filter function is used to filter the files that are uploaded.
const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image"))
    callback(null, true); // `null` means no error.
  else callback(new ApiError(400, "Not an image! Please upload only images."), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// The upload middleware is used to handle multipart/form-data, which is used for uploading files.
exports.uploadBrandImage = upload.single("image");

// The processBrandImage middleware is used to resize the image before saving it to disk.
exports.processBrandImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `brand-${req.body.name.toLowerCase()}-${Date.now()}.jpeg`;

  // In case of memory storage, the file is stored in memory as a Buffer object:
  await sharp(req.file.buffer)
    .resize(1000, 1000)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/brands/${filename}`); // Save the image to disk.

  req.body.image = filename; // Save the filename to the request body to be saved in the database.

  next();
});
```

Then use both middlewares in the route

```js
router.post(
  "/",
  uploadBrandImage, // Uploads the image to memory
  processBrandImage, // Processes and saves the image to disk
  createBrandValidator,
  createBrand,
);
```

> Be aware that performing image processing on the server can be resource-intensive and may slow down your application, especially if you have a lot of concurrent uploads. Consider using a cloud service like AWS S3 or Cloudinary for image storage and processing.

### Important Notes

To upload multiple files, you have two options:

- Use `.array(fieldName, maxCount)` if you're uploading multiple files under a single field as mentioned earlier.
- Or use `.fields(fields)` to handle a combination of single and multiple file fields in the same request.

We can modularize and structure our code more effectively, take a look at how key parts work together: the `middlewares/uploadImagesMiddlewares.js` file defines a reusable middleware for handling single, multiple, and mixed images uploads, which is applied across multiple routes.

To avoid saving images when something goes wrong (like validation errors), we changed how we handle image uploads. Now, instead of saving the image to disk right after uploading it, we first process it and keep it in memory using the processing middleware (like `processBrandImage` middleware). Then, if everything goes well (like the brand is created or updated successfully), we save the image to disk using a special `postTask` function. This makes sure we only save images when the operation actually succeeds. Also, to keep things clean, we use a `preTask` function to delete the old image before updating or deleting a document — so we don’t leave extra files on the server. These `preTask` and `postTask` functions are passed into our generic functions in `factory.js`, which helps us keep the code organized and reuse the same logic in different places.

You can explore code to see the final implementaion.

Read the note in `controllers/productController.js` regarding image array updates during product edits.

### Multer Parsing Limitations

**1. Non-file fields are always parsed as strings**
When using Multer to handle `multipart/form-data`, all non-file fields are returned in `req.body` as **strings**.
This means that even if the client sends numeric values like `25` or booleans like `true`, Multer will not automatically convert them to `Number` or `Boolean`. They will remain `"25"` and `"true"` as strings. This can lead to issues later when validating or performing calculations, unless you explicitly convert them to the correct data types.

**2. Nested fields remain flat (not structured)**
Unlike `express.urlencoded`, Multer does not interpret the structure of field names. If you send a field named `relation.type`, it will appear in `req.body` exactly as `"relation.type"` — a flat key with a string value. Multer will not turn it into a nested object like `{ relation: { type: "..." } }`. If you need structured/nested objects, you’ll have to post-process the fields (e.g., using `qs.parse`) or send JSON as part of the form data.

---

## Returning Full Image URL in Responses Using `toJSON` Method

To automatically include the full URL of the image when sending the data in responses, update the `toJSON` method in the schema. This method is called whenever the document is converted to JSON — such as when returning it in an API response.

For example,

```js
// Transform the image field to include the full URL whenever the document is converted to JSON. This process happens when sending the response i. e. using `res.status(200).json({ ... })`.
brandSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.image) obj.image = `${process.env.BASE_URL}/brands/${obj.image}`;
  return obj;
};
```

---

## Serve Static Files

Add this middleware in `index.js` that allows your app to serve static files—like uploaded images—from the `uploads` folder.

```js
app.use(express.static("uploads"));
```

It makes the `uploads` folder publicly accessible. Any file inside it can now be accessed via a direct URL.

For example, let's say you saved an image at `uploads/brands/123.jpeg`, you can access it from the browser at: `http://localhost:3000/brands/123.jpeg`

---

## User Modules

The `users` collection is managed through several modules, each serving a distinct purpose in the system architecture:

### 1. Users CRUD – for Admins

This module follows the factory-based controller pattern and adopts the same image handling strategy used elsewhere in the system.

**Key Highlights:**

- **Field Uniqueness Validation:** Fields like email and phone are validated carefully during both creation and updates. For implementation details, see `validators/userValidator.js`, particularly the `updateUserValidator`.
- **Password Security:** Passwords are hashed using bcrypt before being stored in the database.
- **Data Sanitization:** Sensitive information (e.g., passwords) is excluded from API responses using Mongoose’s `select` option along with a custom `.toJSON()` transformation.

### 2. Authentication Module

This module manages user sessions and authentication flow across the app.

- **`controllers/authController.js`**
  Handles registration, login, logout, token refresh, and password reset logic. Key features include:

  - **JWT Access & Refresh Tokens:** Used for stateless session management, with secure handling of token expiration and renewal.
  - **Password Reset Workflow:** Generates secure reset codes, sends them via email, and validates them with strict time-bound logic.

- **`middlewares/protectionMiddlewares.js`**
  Provides:

  - `authenticate`: Verifies JWTs and ensures that the user exists.
  - `allowTo`: Enforces role-based access control by restricting access to specific user roles.

- **Cookies Support**
  To enable secure handling of refresh tokens via cookies, make sure to include the cookie parser middleware in your main `index.js` file:

  ```js
  app.use(cookiesParser);
  ```

  This parser is defined in `middlewares/cookiesParserMiddleware.js`, which extracts cookies from incoming requests and makes them accessible through `req.cookies`.

### 3. Profile Module

This module empowers authenticated users to update their personal data. See `controllers/profileController.js` for implementation details.

### 4. Addresses CRUD

Allows users to manage their own saved addresses. Stored as subdocuments in the user model. See `controllers/addressController.js` for implementation details.

### 5. Wishlist Module

Allows users to save products for later. Items are stored as product references in the user document. See `controllers/wishlistController.js` for implementation details.

### 6. Cart Module

Manages cart items and applied coupons within the user document. See `controllers/cartController.js` for implementation details.

---

## CORS Configuration

To enable cross-origin requests securely, we established a centralized CORS management strategy using the [`cors`](https://github.com/expressjs/cors) middleware.

```bash
npm i cors
```

We encapsulated the configuration into a reusable middleware: `middlewares/corsHandlerMiddleware.js`.

### Usage in `index.js`

Simply import and register the middleware globally before defining your routes:

```js
const corsHandler = require("./middlewares/corsHandlerMiddleware");
app.use(corsHandler);
```

### Example `.env` Configuration

```env
WHITE_LIST=["http://localhost:3000","https://your-frontend.com"]
```

### Verifying the CORS Behavior

You can manually test CORS enforcement by attempting requests from various origins. Open your browser’s console and execute:

```js
try {
  const response = await fetch("http://localhost:5145/products"); // Adjust the URL to match your API endpoint
  console.log(await response.json());
} catch (error) {
  console.error(error);
}
```

Perform the request once from an allowed origin (such as your frontend application), and once from a disallowed origin (e.g., `http://www.google.com`).
You should observe:

- The request from the **allowed origin** completes successfully.
- The request from the **unauthorized origin** fails with a CORS policy error, preventing unauthorized cross-origin access.

## Virtual Population

To display related data without embedding it directly, we use **Mongoose virtuals**.

For example, we want each product to show its associated reviews — but without physically storing them inside the product document.

### Enabling Virtuals in Responses

Enable virtuals in the schema options so they appear in API responses:

```js
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
}
```

### Defining the Virtual Field

Define a virtual field named `reviews` in the product schema:

```js
productSchema.virtual("reviews", {
  localField: "_id", // The product’s _id
  ref: "Review", // Reference to the Review model
  foreignField: "product", // The field that match this product’s _id
});
```

> This setup tells Mongoose to **add a virtual field named `reviews`, which includes all reviews where the `product` field matches the current product’s `_id`** — without actually storing them in the product document.

### Populating the Virtual

Virtual fields don’t populate automatically — you must **explicitly populate them** when querying:

```js
exports.getProduct = factory.getDocument(ProductModel, { populate: "reviews" });
```

> Even though `toJSON` enables the virtual to show in responses, it won’t appear unless you explicitly **populate** the virtual field.

---

## App Deployment

You can deploy your Express application using platforms like **Vercel**, **Render**, or **Railway**.
Below is a streamlined guide for deploying on **Vercel**:

1. **Push your project to GitHub**

   Make sure your app is committed and pushed to a GitHub repository.

2. **Sign in to Vercel**

   Go to [Vercel](https://vercel.com) and sign in using your GitHub account.

3. **Import your project**

   In your Vercel dashboard, click **“Add New Project”** → **“Import Git Repository”** → choose your repo.

4. **Configure the settings**

   - For the **Framework Preset**, select **“Express”**.
   - If needed, specify the **Build Command** and the **Output Directory**.
   - Add your production variables (like database URIs) under the **Environment Variables** tab.

5. **Deploy**

   Click **Deploy** — Vercel will build and deploy your app automatically.
   Once done, you’ll get a public URL like `https://your-app-name.vercel.app`.

### Vercel Limitations

Vercel runs backend code as **serverless functions**, meaning each route is executed on-demand instead of running a full-time server. It has key limitations when deploying a Node.js/Express app: you **can’t specify a custom running command** like `npm run start`, and **you can’t handle files on disk**, as Serverless Functions don’t support persistent storage. These restrictions make it unsuitable for full backend apps that need custom startup logic or file processing. The best way to deploy such apps is to use your own VPS, which offers full control but comes with added cost — and is not covered in this tutorial.

---

## Stripe Payment Integration

To handle online payments, this project integrates **Stripe**, a powerful and developer-friendly payment platform. While the best way to dive deeper is by reading the [official documentation](https://stripe.com/docs), here's a quick overview of what we implemented.

Install the Stripe package to interact with Stripe’s API for creating payment sessions and handling webhooks,

```bash
npm install stripe
```

### How It Works

In `orderRoute.js`, two main routes handle the payment flow:

- **`/checkout-session`**: Creates a Stripe Checkout session and returns a URL to Stripe’s hosted payment page.
- **`/card-order`**: Receives Stripe’s webhook call after successful payment and creates the order in your database.

The logic for these routes lives in `orderController.js`.

### Webhook Setup

To securely handle Stripe webhooks, the raw body must be preserved for signature verification. This line in `index.js` ensures that:

```js
app.use("/orders/card-order", express.raw({ type: "application/json" }));
```

Place it **BEFORE** your JSON body parser.

You can set a webhook call from the [Stripe Dashboard](https://dashboard.stripe.com/). To receive webhook events from Stripe, you need to deploy your app and provide a publicly accessible webhook URL in the dashboard.

### Stripe Secrets

Set up your environment variables with `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET_KEY`. These values are available in your [Stripe Dashboard](https://dashboard.stripe.com/), and are essential for authentication and webhook validation.

---

## App Security Enhancements

Throughout this project, we’ve implemented several key practices to strengthen the security of our Node.js application. Below is a summary of the most important measures:

### Core Security Practices

- **Environment Variables**: Sensitive data such as API keys and database URIs are stored in environment variables instead of being hard-coded in the source code.

- **JWT Authentication**: We use JSON Web Tokens (JWT) to authenticate users and protect restricted routes, ensuring that only authorized users can access sensitive resources.

- **CORS Configuration**: Cross-Origin Resource Sharing (CORS) is configured to allow requests only from trusted domains.

- **Input Validation & Sanitization**: All user inputs are validated and sanitized to prevent injection attacks and malformed requests.

- **Centralized Error Handling**: A global error handler ensures consistent error responses while hiding sensitive internal details from the client.

### Additional Security Measures

- **Request Body Size Limiting**: To prevent denial-of-service (DoS) attacks, we limit the size of incoming JSON payloads in `index.js`:

  ```js
  app.use(express.json({ limit: "10kb" }));
  ```

- **Rate Limiting**: We use the `express-rate-limit` middleware to limit the number of requests from a single IP, protecting the API from abuse and brute-force attacks.

- **NoSQL Injection Protection**: With the `express-mongo-sanitize` package, user input is sanitized to remove MongoDB-specific operators like `$` and `.`, reducing the risk of NoSQL injections.

- **Cross-Site Scripting (XSS) Protection**: We use the `express-xss-sanitizer` middleware to clean user input and prevent malicious scripts from being injected into responses. It helps safeguard both the server and clients from XSS attacks.

For implementation details, refer to the `securityMiddlewares.js` file.

### Final Notes

By applying these best practices, we've significantly improved the security posture of our Node.js application. However, security is an ongoing effort—it's essential to stay updated with new vulnerabilities, libraries, and recommendations.

📚 For a comprehensive guide on Node.js security practices, refer to the [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html).
