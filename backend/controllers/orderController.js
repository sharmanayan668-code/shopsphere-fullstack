const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const { decrementStockForOrder, restoreStockForOrder } = require('../services/inventoryService');

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, couponCode, paymentMethod = 'mock_card' } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ message: 'Complete delivery address is required' });
    }

    // 1. Fetch user's cart from MongoDB
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your shopping cart is empty' });
    }

    // 2. Validate products, stock, and calculate subtotal on the SERVER
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product "${item.product.name}" is no longer available` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
        });
      }

      const unitPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        price: unitPrice,
        quantity: item.quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        subtotal: itemSubtotal
      });
    }

    // 3. Server-side Coupon validation & calculation
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() <= new Date(coupon.expiryDate) && subtotal >= coupon.minOrderAmount) {
        appliedCouponCode = coupon.code;
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.round(discountAmount);

        // Increment coupon usage
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    // 4. Calculate Shipping and Taxes
    const shippingFee = subtotal > 1500 ? 0 : 99; // Free delivery over ₹1500
    const taxAmount = Math.round((subtotal - discountAmount) * 0.05); // 5% GST
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);

    // 5. Generate Order Number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 6. Create Order Document
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      coupon: {
        code: appliedCouponCode,
        discountAmount
      },
      taxAmount,
      shippingFee,
      totalAmount,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      paymentMethod
    });

    // 7. Atomic inventory decrement + movement log
    await decrementStockForOrder(order);

    // 8. Empty customer's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private (Customer or Admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Customer can only view their own orders
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order (Eligible only if not shipped/delivered)
// @route   POST /api/orders/:id/cancel
// @access  Private (Customer or Admin)
exports.cancelOrder = async (req, res) => {
  try {
    const { reason = 'Cancelled by customer' } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Order cannot be cancelled because it is already ${order.orderStatus}`
      });
    }

    // 1. Restore Stock
    await restoreStockForOrder(order, `Order cancellation: ${reason}`);

    // 2. Update Order Status
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;

    if (order.paymentStatus === 'successful') {
      order.paymentStatus = 'refunded';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const previousStatus = order.orderStatus;

    // Handle cancellation from admin
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      await restoreStockForOrder(order, 'Cancelled by administrator');
      order.cancelledAt = new Date();
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
