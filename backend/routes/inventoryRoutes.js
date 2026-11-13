const express = require('express');
const router = express.Router();
const {
  getInventoryOverview,
  getLowStockAlerts,
  adjustProductStock,
  getInventoryMovements
} = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/', getInventoryOverview);
router.get('/low-stock', getLowStockAlerts);
router.post('/:productId/adjust', adjustProductStock);
router.get('/movements', getInventoryMovements);

module.exports = router;
