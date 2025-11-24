const { query } = require('../config/database');

class Feedback {
  static async create(feedbackData) {
    const { ticket_id, user_id, technician_id, rating, comment, response_time_rating, resolution_quality_rating } = feedbackData;
    
    const sql = `INSERT INTO feedback 
                 (ticket_id, user_id, technician_id, rating, comment, response_time_rating, resolution_quality_rating) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await query(sql, [
      ticket_id, user_id, technician_id || null, rating, comment || null,
      response_time_rating || null, resolution_quality_rating || null
    ]);
    return await this.findById(result.insertId);
  }

  static async findById(id) {
    const sql = `SELECT f.*, 
                 u.first_name as user_name, u.last_name as user_lastname,
                 t.first_name as technician_name, t.last_name as technician_lastname,
                 tk.ticket_number
                 FROM feedback f
                 LEFT JOIN users u ON f.user_id = u.id
                 LEFT JOIN users t ON f.technician_id = t.id
                 LEFT JOIN tickets tk ON f.ticket_id = tk.id
                 WHERE f.id = ?`;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findByTicket(ticketId) {
    const sql = `SELECT f.*, 
                 u.first_name as user_name, u.last_name as user_lastname
                 FROM feedback f
                 LEFT JOIN users u ON f.user_id = u.id
                 WHERE f.ticket_id = ?`;
    const results = await query(sql, [ticketId]);
    return results[0] || null;
  }

  static async findByTechnician(technicianId, filters = {}) {
    let sql = `SELECT f.*, 
               u.first_name as user_name, u.last_name as user_lastname,
               tk.ticket_number, tk.title as ticket_title
               FROM feedback f
               LEFT JOIN users u ON f.user_id = u.id
               LEFT JOIN tickets tk ON f.ticket_id = tk.id
               WHERE f.technician_id = ?`;
    const params = [technicianId];

    if (filters.date_from) {
      sql += ' AND DATE(f.created_at) >= ?';
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      sql += ' AND DATE(f.created_at) <= ?';
      params.push(filters.date_to);
    }

    sql += ' ORDER BY f.created_at DESC';
    return await query(sql, params);
  }

  static async getStatistics(filters = {}) {
    let sql = `SELECT 
               COUNT(*) as total_feedback,
               AVG(rating) as avg_rating,
               AVG(response_time_rating) as avg_response_rating,
               AVG(resolution_quality_rating) as avg_resolution_rating,
               SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive_feedback,
               SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) as negative_feedback
               FROM feedback WHERE 1=1`;
    const params = [];

    if (filters.technician_id) {
      sql += ' AND technician_id = ?';
      params.push(filters.technician_id);
    }

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

module.exports = Feedback;

