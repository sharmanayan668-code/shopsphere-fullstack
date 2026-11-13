const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

/**
 * Decrement stock when order is placed
 */
const decrementStockForOrder = async (order, session = null) => {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product not found for SKU: ${item.sku}`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`);
    }

    const previousStock = product.stock;
    const newStock = previousStock - item.quantity;

    product.stock = newStock;
    await product.save({ session });

    await InventoryMovement.create(
      [
        {
          product: product._id,
          previousStock,
          changeQuantity: -item.quantity,
          newStock,
          movementType: 'sale',
          reason: `Sold in Order #${order.orderNumber}`,
          relatedOrder: order._id
        }
      ],
      { session }
    );
  }
};

/**
 * Restore stock when order is cancelled or payment fails
 */
const restoreStockForOrder = async (order, reason = 'Order cancelled', session = null) => {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const previousStock = product.stock;
    const newStock = previousStock + item.quantity;

    product.stock = newStock;
    await product.save({ session });

    await InventoryMovement.create(
      [
        {
          product: product._id,
          previousStock,
          changeQuantity: item.quantity,
          newStock,
          movementType: 'cancellation_restock',
          reason: `${reason} (Order #${order.orderNumber})`,
          relatedOrder: order._id
        }
      ],
      { session }
    );
  }
};

/**
 * Admin manual stock adjustment
 */
const adjustStockManual = async (productId, changeQuantity, reason, adminId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const previousStock = product.stock;
  const newStock = previousStock + Number(changeQuantity);

  if (newStock < 0) {
    throw new Error('Stock cannot be negative');
  }

  product.stock = newStock;
  await product.save();

  const movement = await InventoryMovement.create({
    product: product._id,
    previousStock,
    changeQuantity: Number(changeQuantity),
    newStock,
    movementType: 'admin_adjustment',
    reason: reason || 'Manual admin inventory adjustment',
    admin: adminId
  });

  return { product, movement };
};

module.exports = {
  decrementStockForOrder,
  restoreStockForOrder,
  adjustStockManual
};
