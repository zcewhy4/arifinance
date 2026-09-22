const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');
const authMiddleware = require('../middleware/authMiddleware');
const { savingsValidator, idParamValidator } = require('../middleware/validators');

router.use(authMiddleware);

router.get('/', savingsController.getAll);
router.get('/:id', idParamValidator, savingsController.getById);
router.post('/', savingsValidator, savingsController.create);
router.put('/:id', idParamValidator, savingsController.update);
router.put('/:id/add', idParamValidator, savingsController.addAmount);
router.delete('/:id', idParamValidator, savingsController.remove);

module.exports = router;
