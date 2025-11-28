const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const incidentTypeController = require("../controllers/incidentTypeController");

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/incident-types - Obtener todos los tipos de incidente
router.get("/", incidentTypeController.getAll);

// GET /api/incident-types/:id - Obtener un tipo de incidente por ID
router.get("/:id", incidentTypeController.getById);

// POST /api/incident-types - Crear un nuevo tipo de incidente (solo admin)
router.post("/", authorize("admin"), incidentTypeController.create);

// PUT /api/incident-types/:id - Actualizar un tipo de incidente (solo admin)
router.put("/:id", authorize("admin"), incidentTypeController.update);

// DELETE /api/incident-types/:id - Eliminar un tipo de incidente (solo admin)
router.delete("/:id", authorize("admin"), incidentTypeController.delete);

module.exports = router;
