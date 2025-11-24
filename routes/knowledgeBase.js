const express = require('express');
const router = express.Router();
const knowledgeBaseController = require('../controllers/knowledgeBaseController');
const { authenticate, authorize } = require('../middleware/auth');

// Rutas públicas (solo lectura)
router.get('/', knowledgeBaseController.getAll);
router.get('/:id', knowledgeBaseController.getById);

// Rutas protegidas
router.use(authenticate);

router.post('/', authorize('admin', 'technician'), knowledgeBaseController.create);
router.put('/:id', authorize('admin', 'technician'), knowledgeBaseController.update);
router.delete('/:id', authorize('admin'), knowledgeBaseController.delete);
router.post('/:id/helpful', knowledgeBaseController.markHelpful);

module.exports = router;

