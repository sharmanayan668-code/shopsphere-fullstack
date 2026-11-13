const express = require('express');
const router = express.Router();
const {
  simulatePayment,
  getPaymentByOrder,
  getAllPayments
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/simulate', simulatePayment);
router.get('/order/:orderId', getPaymentByOrder);
router.get('/', adminOnly, getAllPayments);

module.exports = router;
