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
