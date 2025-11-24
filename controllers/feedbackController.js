const Feedback = require('../models/Feedback');
const Ticket = require('../models/Ticket');

class FeedbackController {
  async create(req, res) {
    try {
      const ticket = await Ticket.findById(req.body.ticket_id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket no encontrado'
        });
      }

      // Verificar que el ticket esté cerrado
      if (ticket.status !== 'closed') {
        return res.status(400).json({
          success: false,
          message: 'Solo se puede dar feedback a tickets cerrados'
        });
      }

      // Verificar que el usuario sea el creador del ticket
      if (ticket.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Solo el creador del ticket puede dar feedback'
        });
      }

      // Verificar que no exista feedback previo
      const existingFeedback = await Feedback.findByTicket(req.body.ticket_id);
      if (existingFeedback) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe feedback para este ticket'
        });
      }

      const feedback = await Feedback.create({
        ticket_id: req.body.ticket_id,
        user_id: req.user.id,
        technician_id: ticket.assigned_to,
        rating: req.body.rating,
        comment: req.body.comment,
        response_time_rating: req.body.response_time_rating,
        resolution_quality_rating: req.body.resolution_quality_rating
      });

      res.status(201).json({
        success: true,
        message: 'Feedback registrado exitosamente',
        data: { feedback }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear feedback',
        error: error.message
      });
    }
  }

  async getByTicket(req, res) {
    try {
      const feedback = await Feedback.findByTicket(req.params.ticketId);
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback no encontrado'
        });
      }

      res.json({
        success: true,
        data: { feedback }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener feedback',
        error: error.message
      });
    }
  }

  async getByTechnician(req, res) {
    try {
      const filters = {
        date_from: req.query.date_from,
        date_to: req.query.date_to
      };

      const feedbacks = await Feedback.findByTechnician(req.params.technicianId, filters);

      res.json({
        success: true,
        data: { feedbacks }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener feedback',
        error: error.message
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const filters = {
        technician_id: req.query.technician_id,
        date_from: req.query.date_from,
        date_to: req.query.date_to
      };

      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const statistics = await Feedback.getStatistics(filters);

      res.json({
        success: true,
        data: { statistics }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }
}

module.exports = new FeedbackController();

