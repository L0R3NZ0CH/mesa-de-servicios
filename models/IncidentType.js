const { pool } = require("../config/database");

class IncidentType {
  static async findAll() {
    try {
      const [types] = await pool.query(
        `SELECT id, name, description, created_at, updated_at
         FROM incident_types
         ORDER BY name ASC`
      );
      return types;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [types] = await pool.query(
        `SELECT id, name, description, created_at, updated_at
         FROM incident_types
         WHERE id = ?`,
        [id]
      );
      return types[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const [result] = await pool.query(
        `INSERT INTO incident_types (name, description)
         VALUES (?, ?)`,
        [data.name, data.description || null]
      );
      return this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      await pool.query(
        `UPDATE incident_types
         SET name = ?,
             description = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [data.name, data.description || null, id]
      );
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Verificar si hay tickets usando este tipo
      const [tickets] = await pool.query(
        `SELECT COUNT(*) as count FROM tickets WHERE incident_type_id = ?`,
        [id]
      );

      if (tickets[0].count > 0) {
        throw new Error(
          `No se puede eliminar este tipo de incidente porque hay ${tickets[0].count} ticket(s) asociado(s)`
        );
      }

      await pool.query(`DELETE FROM incident_types WHERE id = ?`, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics(id) {
    try {
      const [stats] = await pool.query(
        `SELECT 
          COUNT(*) as total_tickets,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
          SUM(CASE WHEN status IN ('open', 'in_progress', 'pending') THEN 1 ELSE 0 END) as active_tickets,
          AVG(CASE 
            WHEN resolution_time IS NOT NULL AND created_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, created_at, resolution_time) 
          END) as avg_resolution_hours,
          SUM(CASE WHEN sla_breached = TRUE THEN 1 ELSE 0 END) as sla_breached_count
         FROM tickets
         WHERE incident_type_id = ?`,
        [id]
      );
      return stats[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = IncidentType;
