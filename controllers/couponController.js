const CouponModel = require("../models/couponModel");
const factory = require("../utils/factory");

exports.cleanBody = (req, res, next) => {
  // Remove fields that should not be set or modified directly by the client, ensuring data integrity when passing the body to the factory handler.
  delete req.body.usageCount;
  next();
};

exports.createCoupon = factory.createDocument(CouponModel);

exports.getCoupons = factory.getAllDocuments(CouponModel, { searchableFields: ["code"] });

exports.getCoupon = factory.getDocument(CouponModel);

exports.updateCoupon = factory.updateDocument(CouponModel);

exports.deleteCoupon = factory.deleteDocument(CouponModel);
