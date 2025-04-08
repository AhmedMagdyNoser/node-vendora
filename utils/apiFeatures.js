class ApiFeatures {
  constructor(monogooseQuery, requestQuery) {
    this.mongooseQuery = monogooseQuery; // The mongoose query
    this.requestQuery = requestQuery; // The request query string
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

  search() {
    if (this.requestQuery.keyword) {
      this.mongooseQuery.find({
        $or: [
          { title: { $regex: this.requestQuery.keyword, $options: "i" } },
          { description: { $regex: this.requestQuery.keyword, $options: "i" } },
        ],
      });
    }
    return this; // Returning this for method chaining
  }

  paginate() {
    const page = parseInt(this.requestQuery.page) || 1;
    const limit = parseInt(this.requestQuery.limit) || 10;
    const skip = (page - 1) * limit;
    this.mongooseQuery.skip(skip).limit(limit);
    return this; // Returning this for method chaining
  }

  sort() {
    if (this.requestQuery.sort) {
      const sortBy = this.requestQuery.sort.split(",").join(" ");
      this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery.sort("-createdAt");
    } // Default sorting by createdAt field in descending order
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

module.exports = ApiFeatures;
