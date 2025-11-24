const { query } = require('../config/database');

class Comment {
  static async create(commentData) {
    const { ticket_id, user_id, comment, is_internal } = commentData;
    
    const sql = `INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal) 
                 VALUES (?, ?, ?, ?)`;
    const result = await query(sql, [ticket_id, user_id, comment, is_internal || false]);
    return await this.findById(result.insertId);
  }

  static async findById(id) {
    const sql = `SELECT c.*, u.first_name, u.last_name, u.role 
                 FROM ticket_comments c
                 LEFT JOIN users u ON c.user_id = u.id
                 WHERE c.id = ?`;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findByTicket(ticketId, includeInternal = false) {
    let sql = `SELECT c.*, u.first_name, u.last_name, u.role 
               FROM ticket_comments c
               LEFT JOIN users u ON c.user_id = u.id
               WHERE c.ticket_id = ?`;
    const params = [ticketId];

    if (!includeInternal) {
      sql += ' AND c.is_internal = 0';
    }

    sql += ' ORDER BY c.created_at ASC';
    return await query(sql, params);
  }

  static async update(id, comment, userId) {
    const sql = `UPDATE ticket_comments SET comment = ? 
                 WHERE id = ? AND user_id = ?`;
    await query(sql, [comment, id, userId]);
    return await this.findById(id);
  }

  static async delete(id, userId, userRole) {
    // Solo el autor o un admin puede eliminar
    if (userRole !== 'admin') {
      const comment = await this.findById(id);
      if (comment && comment.user_id !== userId) {
        throw new Error('No tiene permisos para eliminar este comentario');
      }
    }

    const sql = 'DELETE FROM ticket_comments WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}

module.exports = Comment;

