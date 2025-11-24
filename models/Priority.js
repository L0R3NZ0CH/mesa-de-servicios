const { query } = require('../config/database');

class Priority {
  static async findAll() {
    const sql = 'SELECT * FROM priorities ORDER BY level';
    return await query(sql);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM priorities WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }
}

module.exports = Priority;

