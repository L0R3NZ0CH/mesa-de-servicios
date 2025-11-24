const SLA = require('../models/SLA');
const Notification = require('../models/Notification');
const Ticket = require('../models/Ticket');
const { query } = require('../config/database');

class SLAController {
  async getConfig(req, res) {
    try {
      const config = await SLA.getAllConfig();
      res.json({
        success: true,
        data: { config }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener configuración SLA',
        error: error.message
      });
    }
  }

  async updateConfig(req, res) {
    try {
      const { priority_id, response_time_hours, resolution_time_hours, escalation_enabled, escalation_time_hours } = req.body;

      const updated = await SLA.update(priority_id, {
        response_time_hours,
        resolution_time_hours,
        escalation_enabled,
        escalation_time_hours
      });

      res.json({
        success: true,
        message: 'Configuración SLA actualizada exitosamente',
        data: { config: updated }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar configuración SLA',
        error: error.message
      });
    }
  }

  async checkSLA(req, res) {
    try {
      const atRiskTickets = await SLA.checkSLA();

      // Marcar tickets como violados y crear notificaciones
      for (const ticket of atRiskTickets) {
        await SLA.markAsBreached(ticket.id);

        // Notificar al técnico asignado
        if (ticket.assigned_to) {
          await Notification.create({
            user_id: ticket.assigned_to,
            ticket_id: ticket.id,
            type: 'sla_breached',
            title: 'SLA Violado',
            message: `El ticket ${ticket.ticket_number} ha violado su SLA`
          });
        }

        // Notificar a administradores
        const admins = await query('SELECT id FROM users WHERE role = "admin" AND is_active = 1');
        for (const admin of admins) {
          await Notification.create({
            user_id: admin.id,
            ticket_id: ticket.id,
            type: 'sla_breached',
            title: 'SLA Violado',
            message: `El ticket ${ticket.ticket_number} ha violado su SLA`
          });
        }
      }

      res.json({
        success: true,
        message: `Se encontraron ${atRiskTickets.length} tickets con SLA violado`,
        data: { tickets: atRiskTickets }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar SLA',
        error: error.message
      });
    }
  }

  async getCompliance(req, res) {
    try {
      const filters = {
        date_from: req.query.date_from,
        date_to: req.query.date_to
      };

      const compliance = await SLA.getSLACompliance(filters);

      res.json({
        success: true,
        data: { compliance }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener cumplimiento SLA',
        error: error.message
      });
    }
  }
}

module.exports = new SLAController();

