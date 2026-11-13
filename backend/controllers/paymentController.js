const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { restoreStockForOrder } = require('../services/inventoryService');

// @desc    Process Mock Payment (Simulation)
// @route   POST /api/payments/simulate
// @access  Private (Customer)
exports.simulatePayment = async (req, res) => {
  try {
    const {
      orderId,
      scenario = 'success', // 'success', 'failure', 'duplicate'
      paymentMethod = 'mock_card',
      idempotencyKey
    } = req.body;

    if (!orderId || !idempotencyKey) {
      return res.status(400).json({ message: 'Order ID and Idempotency Key are required' });
    }

    // 1. Check idempotency (Duplicate event check)
    const existingPayment = await Payment.findOne({ idempotencyKey });
    if (existingPayment) {
      return res.status(200).json({
        success: true,
        isDuplicateEvent: true,
        message: 'Duplicate payment event ignored (Idempotency matched)',
        data: existingPayment
      });
    }

    // 2. Fetch Order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.paymentStatus === 'successful') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    const transactionRef = `TXN-MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // SCENARIO 1: SUCCESSFUL PAYMENT
    if (scenario === 'success') {
      const payment = await Payment.create({
        order: order._id,
        user: req.user._id,
        amount: order.totalAmount,
        paymentMethod,
        transactionRef,
        idempotencyKey,
        status: 'successful',
        simulationNote: 'Simulated successful customer payment'
      });

      order.paymentStatus = 'successful';
      order.orderStatus = 'confirmed';
      order.paymentRef = transactionRef;
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Mock payment processed successfully! 🎉 Order is confirmed.',
        data: {
          payment,
          order
        }
      });
    }

    // SCENARIO 2: FAILED PAYMENT
    if (scenario === 'failure') {
      const payment = await Payment.create({
        order: order._id,
        user: req.user._id,
        amount: order.totalAmount,
        paymentMethod,
        transactionRef,
        idempotencyKey,
        status: 'failed',
        simulationNote: 'Simulated payment failure (Bank declined/insufficient funds)'
      });

      order.paymentStatus = 'failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Mock payment failed (Simulated transaction decline). You can retry or choose another method.',
        data: {
          payment,
          order
        }
      });
    }

    // SCENARIO 3: UNKNOWN SCENARIO
    return res.status(400).json({ message: 'Invalid scenario. Use "success" or "failure"' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment details by Order ID
// @route   GET /api/payments/order/:orderId
// @access  Private (Customer or Admin)
exports.getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId }).sort({ createdAt: -1 });
    if (!payment) {
      return res.status(404).json({ message: 'No payment record found for this order' });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments list (Admin)
// @route   GET /api/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('order', 'orderNumber totalAmount')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
