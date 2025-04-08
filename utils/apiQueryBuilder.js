class ApiQueryBuilder {
  constructor(mongooseModel, requestQuery) {
    this.mongooseModel = mongooseModel; // The mongoose model (e.g., ProductModal)
    this.requestQuery = requestQuery; // The request query parameters (e.g., req.query)
    this.mongooseQuery = mongooseModel.find(); // The mongoose query object
    this.documentsCount = null; // To hold the count of documents
    this.pagination = null; // To hold pagination details
  }

  filter() {
    // Copying the query object (to avoid mutating the original request object)
    const queryObj = JSON.parse(JSON.stringify(this.requestQuery));
    // Removing specific fields from the query object
    ["keyword", "page", "limit", "sort", "fields"].forEach((excludedField) => delete queryObj[excludedField]);
    // The request is sent like: /products?rating=5&price[gt]=100
    // The query object will be like: { rating: 5, price: { gt: 100 } }
    // We need to convert it to: { rating: 5, price: { $gt: 100 } }
    this.mongooseQuery.find(JSON.parse(JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`))); // gt -> $gt, gte -> $gte, lt -> $lt, lte -> $lte
    return this; // Returning this for method chaining
  }

  search(...fields) {
    if (this.requestQuery.keyword) {
      const searchQueries = fields.map((field) => ({ [field]: { $regex: this.requestQuery.keyword, $options: "i" } })); // Creating search queries for each field
      this.mongooseQuery.find({ $or: searchQueries }); // Using $or to combine the search queries
    }
    return this; // Returning this for method chaining
  }

  // This method is used to count the number of documents after applying filters (Important for pagination)
  async countFilteredDocuments() {
    this.documentsCount = await this.mongooseQuery.clone().countDocuments();
    return this;
  }

  paginate() {
    const page = parseInt(this.requestQuery.page) || 1;
    const limit = parseInt(this.requestQuery.limit) || 10;
    const skip = (page - 1) * limit;
    this.mongooseQuery.skip(skip).limit(limit);

    // Adding pagination details
    if (this.documentsCount !== null)
      this.pagination = {
        page: page, // Current page
        limit: limit, // Number of documents per page
        totalDocuments: this.documentsCount, // Total number of documents
        totalPages: Math.ceil(this.documentsCount / limit), // Total number of pages
        hasNextPage: skip + limit < this.documentsCount, // Check if there is a next page
        hasPreviousPage: skip > 0, // Check if there is a previous page
      };

    return this; // Returning this for method chaining
  }

  sort() {
    if (this.requestQuery.sort) {
      const sortBy = this.requestQuery.sort.split(",").join(" ");
      this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery.sort("-createdAt"); // Default sorting by createdAt field in descending order
    }
    return this; // Returning this for method chaining
  }

  limitFields() {
    if (this.requestQuery.fields) {
      const fields = this.requestQuery.fields.split(",").join(" ");
      this.mongooseQuery.select(fields);
    }
    return this; // Returning this for method chaining
  }
}

module.exports = ApiQueryBuilder;
