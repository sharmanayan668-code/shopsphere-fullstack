const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get Admin Dashboard Analytics (Real Database-backed data)
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Order Counts
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: 'successful' });
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // 2. Revenue (Sum of totalAmount for paid orders only)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'successful' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // 3. User & Product Counts
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments({ isActive: true });

    // 4. Low stock products count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$reorderThreshold'] }
    });

    // 5. Recent Orders (Last 5)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Top 5 selling items
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: 'successful' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        paidOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        lowStockCount,
        recentOrders,
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
