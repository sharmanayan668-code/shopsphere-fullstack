const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  addReview,
  getAllReviews,
  moderateReview
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, addReview);
router.get('/', protect, adminOnly, getAllReviews);
router.put('/:id/moderate', protect, adminOnly, moderateReview);

module.exports = router;
