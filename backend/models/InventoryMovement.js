const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    changeQuantity: {
      type: Number,
      required: true // Negative for decrement, positive for restock/cancellation
    },
    newStock: {
      type: Number,
      required: true
    },
    movementType: {
      type: String,
      enum: ['sale', 'cancellation_restock', 'admin_adjustment', 'restock'],
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema);
