const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { authenticate, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de administración (solo admin)
router.post('/', authorize('admin'), technicianController.create);
router.get('/', authorize('admin', 'technician'), technicianController.getAll);
router.get('/:id', authorize('admin', 'technician'), technicianController.getById);
router.put('/:id', authorize('admin'), technicianController.update);
router.get('/:id/workload', authorize('admin', 'technician'), technicianController.getWorkload);
router.get('/:id/performance', authorize('admin', 'technician'), technicianController.getPerformance);

// Rutas para técnicos (sus propios tickets)
router.get('/me/tickets', authorize('technician'), technicianController.getMyTickets);

module.exports = router;

