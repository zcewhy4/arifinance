const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { investmentValidator, idParamValidator } = require('../middleware/validators');

router.use(authMiddleware);

router.get('/', investmentController.getAll);
router.get('/:id', idParamValidator, investmentController.getById);
router.post('/', investmentValidator, investmentController.create);
router.put('/:id', idParamValidator, investmentController.update);
router.delete('/:id', idParamValidator, investmentController.remove);

module.exports = router;
