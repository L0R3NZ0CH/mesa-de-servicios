const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

// Rutas públicas (solo lectura)
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Rutas protegidas (solo admin)
router.use(authenticate);
router.use(authorize('admin'));

router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;

