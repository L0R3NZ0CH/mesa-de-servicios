const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const uploadController = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middleware/auth');
const { validations, validate } = require('../middleware/validator');
const upload = require('../config/upload');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de tickets
router.post('/', validations.createTicket, validate, ticketController.create);
router.get('/', ticketController.getAll);
router.get('/statistics', authorize('admin', 'technician'), ticketController.getStatistics);
router.get('/:id', ticketController.getById);
router.put('/:id', ticketController.update);
router.post('/:id/comments', ticketController.addComment);

// Rutas de archivos
router.post('/:ticketId/attachments', upload.single('file'), uploadController.upload);
router.get('/attachments/:id/download', uploadController.download);
router.delete('/attachments/:id', uploadController.delete);

module.exports = router;

