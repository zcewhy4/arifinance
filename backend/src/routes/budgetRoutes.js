const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const { budgetValidator, idParamValidator } = require('../middleware/validators');

router.use(authMiddleware);

router.get('/', budgetController.getAll);
router.post('/', budgetValidator, budgetController.create);
router.put('/:id', idParamValidator, budgetController.update);
router.delete('/:id', idParamValidator, budgetController.remove);

module.exports = router;
