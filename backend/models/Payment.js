const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['mock_upi', 'mock_card', 'mock_netbanking', 'cod'],
      default: 'mock_card'
    },
    transactionRef: {
      type: String,
      required: true,
      unique: true
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'refunded'],
      default: 'pending'
    },
    simulationNote: {
      type: String,
      default: 'Demonstration mock payment event'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
