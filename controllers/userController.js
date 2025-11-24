const User = require('../models/User');

class UserController {
  async getAll(req, res) {
    try {
      const filters = {
        role: req.query.role,
        is_active: req.query.is_active
      };

      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const users = await User.findAll(filters);

      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios',
        error: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuario',
        error: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const user = await User.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar usuario',
        error: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      await User.delete(req.params.id);
      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();

