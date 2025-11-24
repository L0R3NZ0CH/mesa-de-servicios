const Attachment = require('../models/Attachment');
const path = require('path');
const fs = require('fs');

class UploadController {
  async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      const ticketId = req.body.ticket_id || req.params.ticketId;

      if (!ticketId) {
        // Eliminar archivo si no hay ticket_id
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'ticket_id es requerido'
        });
      }

      const attachment = await Attachment.create({
        ticket_id: ticketId,
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        uploaded_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Archivo subido exitosamente',
        data: { attachment }
      });
    } catch (error) {
      // Eliminar archivo en caso de error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error('Error al eliminar archivo:', e);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error al subir archivo',
        error: error.message
      });
    }
  }

  async download(req, res) {
    try {
      const attachment = await Attachment.findById(req.params.id);
      if (!attachment) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      // Verificar que el archivo existe
      if (!fs.existsSync(attachment.file_path)) {
        return res.status(404).json({
          success: false,
          message: 'El archivo no existe en el servidor'
        });
      }

      res.download(attachment.file_path, attachment.file_name);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al descargar archivo',
        error: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const attachment = await Attachment.findById(req.params.id);
      if (!attachment) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      // Verificar permisos
      if (req.user.role !== 'admin' && attachment.uploaded_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para eliminar este archivo'
        });
      }

      // Eliminar archivo físico
      if (fs.existsSync(attachment.file_path)) {
        fs.unlinkSync(attachment.file_path);
      }

      // Eliminar registro
      await Attachment.delete(req.params.id);

      res.json({
        success: true,
        message: 'Archivo eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar archivo',
        error: error.message
      });
    }
  }
}

module.exports = new UploadController();

