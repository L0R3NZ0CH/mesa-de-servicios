const IncidentType = require("../models/IncidentType");

const incidentTypeController = {
  // Obtener todos los tipos de incidente
  async getAll(req, res) {
    try {
      const types = await IncidentType.findAll();
      res.json({
        success: true,
        data: { incident_types: types },
      });
    } catch (error) {
      console.error("Error obteniendo tipos de incidente:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener tipos de incidente",
      });
    }
  },

  // Obtener un tipo de incidente por ID
  async getById(req, res) {
    try {
      const type = await IncidentType.findById(req.params.id);
      if (!type) {
        return res.status(404).json({
          success: false,
          message: "Tipo de incidente no encontrado",
        });
      }

      // Obtener estadísticas
      const stats = await IncidentType.getStatistics(req.params.id);

      res.json({
        success: true,
        data: { incident_type: { ...type, statistics: stats } },
      });
    } catch (error) {
      console.error("Error obteniendo tipo de incidente:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener tipo de incidente",
      });
    }
  },

  // Crear un nuevo tipo de incidente
  async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "El nombre es requerido",
        });
      }

      const newType = await IncidentType.create({ name, description });

      res.status(201).json({
        success: true,
        message: "Tipo de incidente creado exitosamente",
        data: { incident_type: newType },
      });
    } catch (error) {
      console.error("Error creando tipo de incidente:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear tipo de incidente",
      });
    }
  },

  // Actualizar un tipo de incidente
  async update(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "El nombre es requerido",
        });
      }

      const type = await IncidentType.findById(req.params.id);
      if (!type) {
        return res.status(404).json({
          success: false,
          message: "Tipo de incidente no encontrado",
        });
      }

      const updatedType = await IncidentType.update(req.params.id, {
        name,
        description,
      });

      res.json({
        success: true,
        message: "Tipo de incidente actualizado exitosamente",
        data: { incident_type: updatedType },
      });
    } catch (error) {
      console.error("Error actualizando tipo de incidente:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar tipo de incidente",
      });
    }
  },

  // Eliminar un tipo de incidente
  async delete(req, res) {
    try {
      const type = await IncidentType.findById(req.params.id);
      if (!type) {
        return res.status(404).json({
          success: false,
          message: "Tipo de incidente no encontrado",
        });
      }

      await IncidentType.delete(req.params.id);

      res.json({
        success: true,
        message: "Tipo de incidente eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error eliminando tipo de incidente:", error);

      // Error específico si hay tickets asociados
      if (error.message.includes("ticket(s) asociado(s)")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error al eliminar tipo de incidente",
      });
    }
  },
};

module.exports = incidentTypeController;
