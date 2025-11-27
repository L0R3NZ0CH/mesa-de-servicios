const express = require('express');
const router = express.Router();
const knowledgeBaseController = require('../controllers/knowledgeBaseController');
const { authenticate, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación para tracking
router.use(authenticate);

// Rutas de lectura (autenticadas para tracking de vistas/likes)
router.get('/', knowledgeBaseController.getAll);
router.get('/:id', knowledgeBaseController.getById);

// Rutas de escritura (requieren permisos adicionales)
router.post('/', authorize('admin', 'technician'), knowledgeBaseController.create);
router.put('/:id', authorize('admin', 'technician'), knowledgeBaseController.update);
router.delete('/:id', authorize('admin'), knowledgeBaseController.delete);
router.post('/:id/helpful', knowledgeBaseController.markHelpful);

module.exports = router;

