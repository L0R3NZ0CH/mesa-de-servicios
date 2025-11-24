const Ticket = require('../models/Ticket');
const Feedback = require('../models/Feedback');
const Technician = require('../models/Technician');
const SLA = require('../models/SLA');
const { query } = require('../config/database');

class ReportController {
  async getTicketReport(req, res) {
    try {
      const dateFrom = req.query.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];

      const statistics = await Ticket.getStatistics({
        date_from: dateFrom,
        date_to: dateTo
      });

      // Tickets por prioridad
      const byPriority = await query(`
        SELECT p.name, p.level, COUNT(*) as count
        FROM tickets t
        LEFT JOIN priorities p ON t.priority_id = p.id
        WHERE DATE(t.created_at) BETWEEN ? AND ?
        GROUP BY p.id, p.name, p.level
        ORDER BY p.level
      `, [dateFrom, dateTo]);

      // Tickets por categoría
      const byCategory = await query(`
        SELECT c.name, COUNT(*) as count
        FROM tickets t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE DATE(t.created_at) BETWEEN ? AND ?
        GROUP BY c.id, c.name
        ORDER BY count DESC
      `, [dateFrom, dateTo]);

      // Tickets por técnico
      const byTechnician = await query(`
        SELECT u.first_name, u.last_name, 
               COUNT(*) as total,
               SUM(CASE WHEN t.status = 'resolved' THEN 1 ELSE 0 END) as resolved,
               AVG(TIMESTAMPDIFF(HOUR, t.created_at, t.resolution_time)) as avg_resolution_time
        FROM tickets t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE DATE(t.created_at) BETWEEN ? AND ?
        AND t.assigned_to IS NOT NULL
        GROUP BY u.id, u.first_name, u.last_name
        ORDER BY total DESC
      `, [dateFrom, dateTo]);

      res.json({
        success: true,
        data: {
          period: { from: dateFrom, to: dateTo },
          summary: statistics,
          byPriority,
          byCategory,
          byTechnician
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte',
        error: error.message
      });
    }
  }

  async getSLAReport(req, res) {
    try {
      const dateFrom = req.query.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];

      const compliance = await SLA.getSLACompliance({
        date_from: dateFrom,
        date_to: dateTo
      });

      // SLA por prioridad
      const byPriority = await query(`
        SELECT p.name, p.level,
               COUNT(*) as total,
               SUM(CASE WHEN t.sla_breached = 0 THEN 1 ELSE 0 END) as compliant,
               SUM(CASE WHEN t.sla_breached = 1 THEN 1 ELSE 0 END) as breached
        FROM tickets t
        LEFT JOIN priorities p ON t.priority_id = p.id
        WHERE DATE(t.created_at) BETWEEN ? AND ?
        GROUP BY p.id, p.name, p.level
        ORDER BY p.level
      `, [dateFrom, dateTo]);

      // Tiempos promedio
      const avgTimes = await query(`
        SELECT 
          AVG(TIMESTAMPDIFF(HOUR, created_at, response_time)) as avg_response_time,
          AVG(TIMESTAMPDIFF(HOUR, created_at, resolution_time)) as avg_resolution_time
        FROM tickets
        WHERE DATE(created_at) BETWEEN ? AND ?
        AND status IN ('resolved', 'closed')
      `, [dateFrom, dateTo]);

      res.json({
        success: true,
        data: {
          period: { from: dateFrom, to: dateTo },
          compliance,
          byPriority,
          avgTimes: avgTimes[0] || {}
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte SLA',
        error: error.message
      });
    }
  }

  async getTechnicianReport(req, res) {
    try {
      const dateFrom = req.query.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];

      const technicians = await Technician.findAll();

      const report = await Promise.all(
        technicians.map(async (tech) => {
          const performance = await Technician.getPerformance(tech.id, dateFrom, dateTo);
          const feedbackStats = await Feedback.getStatistics({
            technician_id: tech.user_id,
            date_from: dateFrom,
            date_to: dateTo
          });

          return {
            technician: {
              id: tech.id,
              name: `${tech.first_name} ${tech.last_name}`,
              specialty: tech.specialty
            },
            performance,
            feedback: feedbackStats
          };
        })
      );

      res.json({
        success: true,
        data: {
          period: { from: dateFrom, to: dateTo },
          technicians: report
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de técnicos',
        error: error.message
      });
    }
  }

  async getIncidentReport(req, res) {
    try {
      const dateFrom = req.query.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dateTo = req.query.date_to || new Date().toISOString().split('T')[0];

      // Incidentes recurrentes
      const recurring = await query(`
        SELECT t.title, t.description, COUNT(*) as occurrence_count
        FROM tickets t
        WHERE DATE(t.created_at) BETWEEN ? AND ?
        GROUP BY t.title, t.description
        HAVING occurrence_count > 1
        ORDER BY occurrence_count DESC
        LIMIT 10
      `, [dateFrom, dateTo]);

      // Por tipo de incidencia
      const byType = await query(`
        SELECT it.name, COUNT(*) as count,
               AVG(TIMESTAMPDIFF(HOUR, t.created_at, t.resolution_time)) as avg_resolution_time
        FROM tickets t
        LEFT JOIN incident_types it ON t.incident_type_id = it.id
        WHERE DATE(t.created_at) BETWEEN ? AND ?
        AND t.incident_type_id IS NOT NULL
        GROUP BY it.id, it.name
        ORDER BY count DESC
      `, [dateFrom, dateTo]);

      // Por departamento
      const byDepartment = await query(`
        SELECT t.department, COUNT(*) as count
        FROM tickets t
        WHERE DATE(t.created_at) BETWEEN ? AND ?
        AND t.department IS NOT NULL
        GROUP BY t.department
        ORDER BY count DESC
      `, [dateFrom, dateTo]);

      res.json({
        success: true,
        data: {
          period: { from: dateFrom, to: dateTo },
          recurring,
          byType,
          byDepartment
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de incidentes',
        error: error.message
      });
    }
  }
}

module.exports = new ReportController();

