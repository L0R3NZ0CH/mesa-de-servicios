const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

router.post('/', feedbackController.create);
router.get('/ticket/:ticketId', feedbackController.getByTicket);
router.get('/technician/:technicianId', authorize('admin', 'technician'), feedbackController.getByTechnician);
router.get('/statistics', authorize('admin', 'technician'), feedbackController.getStatistics);

module.exports = router;

