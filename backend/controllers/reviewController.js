const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      status: 'approved'
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review for a product
// @route   POST /api/reviews/product/:productId
// @access  Private (Customer)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment,
      status: 'approved'
    });

    // Update product rating and numReviews
    const allReviews = await Review.find({ product: productId, status: 'approved' });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

    product.rating = Math.round(avgRating * 10) / 10;
    product.numReviews = allReviews.length;
    await product.save();

    res.status(201).json({ success: true, message: 'Review added successfully', data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Moderate review (Admin Approve/Reject)
// @route   PUT /api/reviews/:id/moderate
// @access  Private/Admin
exports.moderateReview = async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!review) return res.status(404).json({ message: 'Review not found' });

    res.status(200).json({ success: true, message: `Review marked as ${status}`, data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
