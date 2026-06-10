// Repository CRUD kategori LinkVault

import { getDatabase } from './db';

export const categoryRepository = {
  async getAll() {
    const db = await getDatabase();
    return db.getAllAsync(`
      SELECT c.*, COUNT(b.id) AS bookmark_count
      FROM categories c
      LEFT JOIN bookmarks b ON c.id = b.category_id
      GROUP BY c.id
      ORDER BY c.id ASC
    `);
  },

  async getById(id) {
    const db = await getDatabase();
    return db.getFirstAsync('SELECT * FROM categories WHERE id = ?', id);
  },

  async create({ name, color }) {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO categories (name, color) VALUES (?, ?)',
      name,
      color
    );
    return result.lastInsertRowId;
  },

  async update(id, { name, color }) {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE categories SET name = ?, color = ?, updated_at = datetime(\'now\') WHERE id = ?',
      name,
      color,
      id
    );
  },

  async remove(id) {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM categories WHERE id = ?', id);
  },

  async getBookmarkCount(id) {
    const db = await getDatabase();
    const result = await db.getFirstAsync(
      'SELECT COUNT(*) AS count FROM bookmarks WHERE category_id = ?',
      id
    );
    return result?.count ?? 0;
  },
};
