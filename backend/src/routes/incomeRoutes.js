const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const authMiddleware = require('../middleware/authMiddleware');
const { incomeValidator, incomeUpdateValidator, idParamValidator } = require('../middleware/validators');

router.use(authMiddleware);

router.get('/', incomeController.getAll);
router.get('/:id', idParamValidator, incomeController.getById);
router.post('/', incomeValidator, incomeController.create);
router.put('/:id', idParamValidator, incomeUpdateValidator, incomeController.update);
router.delete('/:id', idParamValidator, incomeController.remove);

module.exports = router;
