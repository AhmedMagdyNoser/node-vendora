# Node.js Summary

## Initializing a Node.js Project

To create a `package.json` file, run:

```bash
npm init --y
```

## Installing Express

```bash
npm i express
```

> In this tutorial, we’ll use CommonJS modules, but you’re free to use ES Modules instead. ES Modules are the modern standard, while CommonJS remains the legacy default in Node.js.

Create a `index.js` in the root directory and add this basic Express server setup:

```js
const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(5145, () => {
  console.log("Listening on port 5145");
});
```

To start the server, run the command:

```bash
node index.js
```

## Installing Nodemon (for automatic server restarts)

```bash
npm i -g nodemon
```

In `package.json`, add the following script:

```json
"scripts": { "dev": "nodemon server.js" }
```

Start the server using:

```bash
npm run dev
```

## Environment Variables

Create a `config.env` file (and ignore it in `.gitignore`) and add:

```
PORT=5145
```

Install `dotenv` (to read .env files):

```bash
npm i dotenv
```

Load environment variables in `index.js`:

```js
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const PORT = process.env.PORT || 5145;
```

## Logging with Morgan

Install `morgan`:

```bash
npm i morgan
```

Use Morgan middleware:

```js
const morgan = require("morgan");
app.use(morgan("dev"));
```

## Database Connection with Mongoose

Install `mongoose`:

```bash
npm i mongoose
```

Connect to MongoDB:

```js
const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB_URI) // Add it in the `config.env`
  .then(() => console.log("DB Connected."))
  .catch((err) => console.log(`DB Connection Error: ${err}`));
```

## Express Middleware

Enable JSON parsing:

```js
app.use(express.json()); // Middleware to parse JSON request bodies
```

## Creating a Mongoose Model

Define a category schema:

```js
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
});

const CategoryModel = mongoose.model("Category", categorySchema);
```

## Creating a Category (POST Request)

```js
app.post("/", (req, res) => {
  const { name, description } = req.body;
  const category = new CategoryModel({ name, description });

  category
    .save()
    .then(() => res.status(201).json(category))
    .catch(() => res.status(500).json({ message: "Error creating category" }));
});
```

---

# CRUD and Folder Structure

Starting to create the folder structure and implementing CRUD routes.

---

## Pagination

### Without Pagination

```js
exports.getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    res.status(200).json({ results: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ message: `Error fetching categories: ${err}` });
  }
};
```

### With Pagination

```js
exports.getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const categories = await CategoryModel.find().skip(skip).limit(limit);
    res.status(200).json({ page, limit, results: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ message: `Error fetching categories: ${err}` });
  }
};
```

---

## Error Handling

- See `deleteCategory` examples in `services/categoryService.js`.
- Implement a global error handler in `index.js` + handle unhandled rejections.
- Check `utils/apiError.js`.

---

## ESLint with Airbnb Configurations

### Install ESLint and Required Packages

```sh
npm i -D eslint eslint-config-airbnb eslint-config-prettier eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-node eslint-plugin-prettier eslint-plugin-react prettier
```

### Create `.eslintrc.json`

```json
{
  "extends": ["airbnb", "prettier", "plugin:node/recommended"],
  "plugins": ["prettier"],
  "rules": {
    "spaced-comment": "off",
    "no-console": "off",
    "consistent-return": "off",
    "func-names": "off",
    "object-shorthand": "off",
    "no-process-exit": "off",
    "no-param-reassign": "off",
    "no-return-await": "off",
    "no-underscore-dangle": "off",
    "class-methods-use-this": "off",
    "no-undef": "warn",
    "prefer-destructuring": ["error", { "object": true, "array": false }],
    "no-unused-vars": ["warn", { "argsIgnorePattern": "req|res|next|val" }]
  }
}
```

### Create `.prettierrc`

```
{
  "tabWidth": 2,
  "printWidth": 125,
  "singleQuote": false
}
```

---

## Population

- See the population example in `services/subcategoryService.js`.

---

## Retrieval with Filtring, Searching, Pagination, Sorting, and Limiting Fields

```js
exports.getProducts = asyncHandler(async (req, res) => {
  // Declaring the mongoose query
  const mongooseQuery = ProductModal.find();

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

Take a look at `utils/apiQueryBuilder` — you'll notice that we've also included additional logic to provide pagination details and additional logic to make the search functionality more flexible.

Here's how this class can be used:

```js
exports.getProducts = asyncHandler(async (req, res) => {
  const apiQueryBuilder = new ApiQueryBuilder(ProductModal, req.query).filter().search("title", "description");
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

So far, we've implemented four modules: `Categories`, `Subcategories`, `Brands`, and `Products`.  
You'll likely notice that much of the logic across these modules is repetitive. To improve **reusability** and maintain **cleaner code**, we can extract the shared logic into a centralized factory.

Take a look at `utils/factory.js` to see how this approach works. We've applied it in both `brandService.js` and `productService.js`, resulting in much cleaner and more maintainable code.

---

## So Far

We’ve learned and applied the following features across different modules:

- **Categories**

  - Project architecture fundamentals
  - Basic validation techniques
  - Introduction to pagination
  - Basic error handling

- **Subcategories**

  - Establishing references to the parent category
  - Utilizing `asyncHandler` for cleaner async logic
  - Basics of Mongoose population

- **Products**

  - Applying custom validation logic
  - Integrating the `apiQueryBuilder` for advanced querying
  - Implementing factory methods for a cleaner architecture

- **Brands**

  - Implementing factory methods for a cleaner architecture

---

# Uploading Files

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

## Handling File Uploads with Custom Configuration

While the default `multer` setup is useful, we often need more control. For that, we’ll use `multer`'s **disk storage engine** along with some organized configuration.

In `services/brandService.js`, we’ll define a custom upload middleware:

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

Then in `routes/brandRoute.js`, use the middleware like this:

```js
router.post("/", uploadBrandImage, createBrandValidator, createBrand);
```

But what if we want to **compress**, **resize**, or apply other processing to the image?

To do so, we’ll need to process the image **in memory** first. This can be achieved by switching to `memoryStorage` and integrating image processing tools like `sharp`.

---

## Moving to In-Memory Storage & Image Processing

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

### Organize Your Code

Now that we've modularized and structured our code more effectively, take a look at how key parts work together: the `middlewares/uploadImagesMiddleware.js` file defines a reusable middleware for handling single image uploads, which is applied across multiple routes in `routes/brandRoute.js`.

### Handling Images the Right Way

To avoid saving images when something goes wrong (like validation errors), we changed how we handle image uploads. Now, instead of saving the image to disk right after uploading it, we first process it and keep it in memory using the `processBrandImage` middleware. Then, if everything goes well (like the brand is created or updated successfully), we save the image to disk using a special `postTask` function. This makes sure we only save images when the operation actually succeeds. Also, to keep things clean, we use a `preTask` function to delete the old image before updating or deleting a brand — so we don’t leave extra files on the server. These `preTask` and `postTask` functions are passed into our generic functions in `factory.js`, which helps us keep the code organized and reuse the same logic in different places.

So the final implementation of `services/brandService.js` will be like that:

```js
// This middleware is used to process the image and create the filename to be saved in the database.
exports.processBrandImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  // Generate a unique filename for the image
  const filename = `brand-${slugify(req.body.name, { lower: true })}-${Date.now()}.jpeg`;
  // Process the image and store it in memory
  const buffer = await sharp(req.file.buffer).resize(1000, 1000).toFormat("jpeg").jpeg({ quality: 95 }).toBuffer();
  // Store the processed image and filename in the request object
  req.image = { buffer, filename };
  // Set the image filename in the request body for database storage
  req.body.image = filename;
  next();
});

// A function to save the processed image
const saveBrandImage = asyncHandler(async (req, res, next, brand) => {
  if (!req.image) return;
  await sharp(req.image.buffer).toFile(`uploads/brands/${req.image.filename}`);
});

// A function to delete the image
const deleteBrandImage = (status) =>
  asyncHandler(async (req, res, next, brand) => {
    // If the status is updating and there is a new image, delete the old image if it exists.
    if (status === "updating" && req.file && brand.image) await fs.promises.unlink(`uploads/brands/${brand.image}`);
    // If the status is deleting, delete the image if it exists.
    if (status === "deleting" && brand.image) await fs.promises.unlink(`uploads/brands/${brand.image}`);
  });

// =============================================================

exports.createBrand = factory.createDocument(BrandModal, {
  fieldToSlugify: "name",
  postTask: saveBrandImage,
});

exports.getBrands = factory.getAllDocuments(BrandModal, { searchableFields: ["name"] });

exports.getBrand = factory.getDocument(BrandModal);

exports.updateBrand = factory.updateDocument(BrandModal, {
  fieldToSlugify: "name",
  preTask: deleteBrandImage("updating"),
  postTask: saveBrandImage,
});

exports.deleteBrand = factory.deleteDocument(BrandModal, { preTask: deleteBrandImage("deleting") });
```

### Returning Full Image URL in API Responses

To automatically include the full URL of the brand image when sending the brand data in responses, update the `toJSON` method in your `models/brandModel.js`. This method is called whenever the document is converted to JSON — such as when returning it in an API response.

```js
brandSchema.methods.toJSON = function () {
  const obj = this.toObject();
  if (obj.image) obj.image = `${process.env.BASE_URL}/brands/${obj.image}`;
  return obj;
};
```

## Serve Static Files

Add this middleware in `index.js` that allows your app to serve static files—like uploaded images—from the `uploads` folder.

```js
app.use(express.static("uploads"));
```

It makes the `uploads` folder publicly accessible. Any file inside it can now be accessed via a direct URL.

For example, let's say you saved an image at `uploads/brands/123.jpeg`, you can access it from the browser at: `http://localhost:3000/brands/123.jpeg`

## Uploading Multiple Files

To upload multiple files, you have two options:

- Use `.array(fieldName, maxCount)` if you're uploading multiple files under a single field as mentioned earlier.
- Or use `.fields(fields)` to handle a combination of single and multiple file fields in the same request.

See this in `middlewares/uploadImagesMiddleware.js`.

---

## Product Image Upload

Now, We add file uploading support to the product module.

Check the following files: `models/productModel.js`, `routes/productRoute.js`, and `services/productService.js`.

You'll notice some small differences, as each product includes a _cover image_ and an _array of additional images_.

Be sure to read the note in `services/productService.js` regarding image array updates during product edits.
