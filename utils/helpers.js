const environment = process.env.ENVIRONMENT || "development";

exports.isDevelopmentMode = environment === "development";
exports.isProductionMode = environment === "production";
