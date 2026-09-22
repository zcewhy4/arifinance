const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/summary', dashboardController.getSummary);
router.get('/chart-data', dashboardController.getChartData);
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);
router.get('/recent-transactions', dashboardController.getRecentTransactions);

module.exports = router;
