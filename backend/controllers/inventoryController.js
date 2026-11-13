const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');
const { adjustStockManual } = require('../services/inventoryService');

// @desc    Get Inventory Overview for all products
// @route   GET /api/inventory
// @access  Private/Admin
exports.getInventoryOverview = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .sort({ stock: 1 });

    const inventoryList = products.map((p) => {
      let status = 'in_stock';
      if (p.stock === 0) status = 'out_of_stock';
      else if (p.stock <= p.reorderThreshold) status = 'low_stock';

      return {
        _id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category ? p.category.name : 'Uncategorized',
        price: p.price,
        stock: p.stock,
        reorderThreshold: p.reorderThreshold,
        status,
        image: p.images && p.images.length > 0 ? p.images[0] : ''
      };
    });

    res.status(200).json({ success: true, count: inventoryList.length, data: inventoryList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Low Stock alerts
// @route   GET /api/inventory/low-stock
// @access  Private/Admin
exports.getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$reorderThreshold'] }
    }).populate('category', 'name');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manual stock adjustment
// @route   POST /api/inventory/:productId/adjust
// @access  Private/Admin
exports.adjustProductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { changeQuantity, reason } = req.body;

    if (changeQuantity === undefined || changeQuantity === 0) {
      return res.status(400).json({ message: 'Valid changeQuantity is required' });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Reason for adjustment is mandatory for audit records' });
    }

    const result = await adjustStockManual(productId, changeQuantity, reason, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Stock adjusted successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get Inventory movements audit logs
// @route   GET /api/inventory/movements
// @access  Private/Admin
exports.getInventoryMovements = async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;

    const total = await InventoryMovement.countDocuments();
    const movements = await InventoryMovement.find()
      .populate('product', 'name sku')
      .populate('admin', 'name email')
      .populate('relatedOrder', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: movements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
