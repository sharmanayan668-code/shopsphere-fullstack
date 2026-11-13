const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper: Cart ko calculate aur format karna
const formatCartResponse = (cart) => {
  let subtotal = 0;
  const items = cart.items
    .filter((item) => item.product) // Agar koi product delete ho gaya ho toh filter out
    .map((item) => {
      const p = item.product;
      const unitPrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      return {
        product: {
          _id: p._id,
          name: p.name,
          sku: p.sku,
          price: p.price,
          discountPrice: p.discountPrice,
          image: p.images && p.images.length > 0 ? p.images[0] : '',
          stock: p.stock
        },
        quantity: item.quantity,
        unitPrice,
        itemTotal,
        inStock: p.stock >= item.quantity
      };
    });

  return {
    _id: cart._id,
    items,
    itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
    subtotal
  };
};

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private (Customer)
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name sku price discountPrice images stock isActive'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({ success: true, data: formatCartResponse(cart) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart or increment quantity
// @route   POST /api/cart/items
// @access  Private (Customer)
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or unavailable' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    const currentQtyInCart = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
    const requestedTotalQty = currentQtyInCart + Number(quantity);

    // Stock check
    if (requestedTotalQty > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} units available in stock. You already have ${currentQtyInCart} in your cart.`
      });
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = requestedTotalQty;
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();

    // Re-populate and return updated cart
    cart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json({ success: true, message: 'Item added to cart', data: formatCartResponse(cart) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update quantity of specific item in cart
// @route   PUT /api/cart/items/:productId
// @access  Private (Customer)
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} units available in stock`
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json({ success: true, data: formatCartResponse(updatedCart) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private (Customer)
exports.removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json({ success: true, message: 'Item removed', data: formatCartResponse(updatedCart) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (Customer)
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};