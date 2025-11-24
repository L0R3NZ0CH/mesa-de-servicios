const { query } = require('../config/database');

class SLA {
  static async getConfig(priorityId) {
    const sql = `SELECT s.*, p.name as priority_name, p.level 
                 FROM sla_config s
                 LEFT JOIN priorities p ON s.priority_id = p.id
                 WHERE s.priority_id = ?`;
    const results = await query(sql, [priorityId]);
    return results[0] || null;
  }

  static async getAllConfig() {
    const sql = `SELECT s.*, p.name as priority_name, p.level 
                 FROM sla_config s
                 LEFT JOIN priorities p ON s.priority_id = p.id
                 ORDER BY p.level`;
    return await query(sql);
  }

  static async update(priorityId, slaData) {
    const { response_time_hours, resolution_time_hours, escalation_enabled, escalation_time_hours } = slaData;
    
    const sql = `UPDATE sla_config 
                 SET response_time_hours = ?, resolution_time_hours = ?, 
                     escalation_enabled = ?, escalation_time_hours = ?
                 WHERE priority_id = ?`;
    await query(sql, [response_time_hours, resolution_time_hours, escalation_enabled, escalation_time_hours, priorityId]);
    return await this.getConfig(priorityId);
  }

  static async checkSLA() {
    // Verificar tickets que están cerca de vencer o han vencido su SLA
    const sql = `SELECT t.*, p.name as priority_name,
                 TIMESTAMPDIFF(HOUR, NOW(), t.sla_response_deadline) as hours_to_response_deadline,
                 TIMESTAMPDIFF(HOUR, NOW(), t.sla_resolution_deadline) as hours_to_resolution_deadline
                 FROM tickets t
                 LEFT JOIN priorities p ON t.priority_id = p.id
                 WHERE t.status NOT IN ('resolved', 'closed')
                 AND (
                   (t.sla_response_deadline <= NOW() AND t.response_time IS NULL) OR
                   (t.sla_resolution_deadline <= NOW() AND t.resolution_time IS NULL)
                 )
                 AND t.sla_breached = 0`;
    return await query(sql);
  }

  static async markAsBreached(ticketId) {
    const sql = 'UPDATE tickets SET sla_breached = 1 WHERE id = ?';
    await query(sql, [ticketId]);
    return true;
  }

  static async getSLACompliance(filters = {}) {
    let sql = `SELECT 
               COUNT(*) as total_tickets,
               SUM(CASE WHEN sla_breached = 0 THEN 1 ELSE 0 END) as compliant,
               SUM(CASE WHEN sla_breached = 1 THEN 1 ELSE 0 END) as breached,
               (SUM(CASE WHEN sla_breached = 0 THEN 1 ELSE 0 END) / COUNT(*) * 100) as compliance_percentage
               FROM tickets WHERE 1=1`;
    const params = [];

    if (filters.date_from) {
      sql += ' AND DATE(created_at) >= ?';
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      sql += ' AND DATE(created_at) <= ?';
      params.push(filters.date_to);
    }

    const results = await query(sql, params);
    return results[0] || {};
  }
}

module.exports = SLA;

