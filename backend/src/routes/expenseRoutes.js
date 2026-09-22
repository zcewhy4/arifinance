const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { idParamValidator } = require('../middleware/validators');

router.use(authMiddleware);

router.get('/', expenseController.getAll);
router.get('/:id', idParamValidator, expenseController.getById);
router.post('/', upload.single('receipt'), expenseController.create);
router.put('/:id', idParamValidator, upload.single('receipt'), expenseController.update);
router.delete('/:id', idParamValidator, expenseController.remove);

module.exports = router;
