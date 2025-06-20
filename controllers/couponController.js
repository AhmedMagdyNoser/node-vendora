const CouponModel = require("../models/couponModel");
const factory = require("../utils/factory");

exports.createCoupon = factory.createDocument(CouponModel);

exports.getCoupons = factory.getAllDocuments(CouponModel, { searchableFields: ["code"] });

exports.getCoupon = factory.getDocument(CouponModel);

exports.updateCoupon = factory.updateDocument(CouponModel);

exports.deleteCoupon = factory.deleteDocument(CouponModel);
