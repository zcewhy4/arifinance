const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const { categoryValidator, idParamValidator } = require('../middleware/validators');

router.use(authMiddleware);

router.get('/', categoryController.getAll);
router.post('/', categoryValidator, categoryController.create);
router.put('/:id', idParamValidator, categoryController.update);
router.delete('/:id', idParamValidator, categoryController.remove);

module.exports = router;
