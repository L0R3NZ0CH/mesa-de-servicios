const { query } = require('../config/database');

class Category {
  static async create(categoryData) {
    const { name, description } = categoryData;
    const sql = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    const result = await query(sql, [name, description || null]);
    return await this.findById(result.insertId);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findAll() {
    const sql = 'SELECT * FROM categories ORDER BY name';
    return await query(sql);
  }

  static async update(id, categoryData) {
    const fields = [];
    const params = [];

    if (categoryData.name) {
      fields.push('name = ?');
      params.push(categoryData.name);
    }

    if (categoryData.description !== undefined) {
      fields.push('description = ?');
      params.push(categoryData.description);
    }

    if (fields.length === 0) return await this.findById(id);

    params.push(id);
    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, params);
    return await this.findById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM categories WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}

module.exports = Category;

