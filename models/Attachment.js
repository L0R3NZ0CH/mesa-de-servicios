const { query } = require('../config/database');

class Attachment {
  static async create(attachmentData) {
    const { ticket_id, file_name, file_path, file_size, file_type, uploaded_by } = attachmentData;
    
    const sql = `INSERT INTO ticket_attachments 
                 (ticket_id, file_name, file_path, file_size, file_type, uploaded_by) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await query(sql, [ticket_id, file_name, file_path, file_size, file_type, uploaded_by]);
    return await this.findById(result.insertId);
  }

  static async findById(id) {
    const sql = `SELECT a.*, u.first_name, u.last_name 
                 FROM ticket_attachments a
                 LEFT JOIN users u ON a.uploaded_by = u.id
                 WHERE a.id = ?`;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findByTicket(ticketId) {
    const sql = `SELECT a.*, u.first_name, u.last_name 
                 FROM ticket_attachments a
                 LEFT JOIN users u ON a.uploaded_by = u.id
                 WHERE a.ticket_id = ?
                 ORDER BY a.created_at DESC`;
    return await query(sql, [ticketId]);
  }

  static async delete(id) {
    const sql = 'DELETE FROM ticket_attachments WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}

module.exports = Attachment;

