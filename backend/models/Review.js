const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      trim: true
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved' // Auto-approved for demo or moderated by admin
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
