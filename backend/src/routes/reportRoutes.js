const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', reportController.getReport);
router.get('/export', reportController.exportCSV);

module.exports = router;
