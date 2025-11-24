const Category = require('../models/Category');

class CategoryController {
  async create(req, res) {
    try {
      const category = await Category.create({
        name: req.body.name,
        description: req.body.description
      });

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: { category }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear categoría',
        error: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const categories = await Category.findAll();
      res.json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener categorías',
        error: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      res.json({
        success: true,
        data: { category }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener categoría',
        error: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const category = await Category.update(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: { category }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar categoría',
        error: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      await Category.delete(req.params.id);
      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar categoría',
        error: error.message
      });
    }
  }
}

module.exports = new CategoryController();

