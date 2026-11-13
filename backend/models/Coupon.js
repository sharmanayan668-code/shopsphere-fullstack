const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: [1, 'Discount value must be at least 1']
    },
    minOrderAmount: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: 0
    },
    expiryDate: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      default: 100
    },
    usedCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
