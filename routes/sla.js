const express = require('express');
const router = express.Router();
const slaController = require('../controllers/slaController');
const { authenticate, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/config', authorize('admin', 'technician'), slaController.getConfig);
router.put('/config', authorize('admin'), slaController.updateConfig);
router.get('/check', authorize('admin'), slaController.checkSLA);
router.get('/compliance', authorize('admin', 'technician'), slaController.getCompliance);

module.exports = router;

