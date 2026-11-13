const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/validate/:code', protect, validateCoupon);
router.get('/', protect, adminOnly, getAllCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

module.exports = router;
