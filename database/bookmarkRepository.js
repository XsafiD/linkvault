// Repository CRUD bookmark LinkVault

import { getDatabase } from './db';

export const bookmarkRepository = {
  async getAll() {
    const db = await getDatabase();
    return db.getAllAsync(
      `SELECT b.*, c.name AS category_name, c.color AS category_color
       FROM bookmarks b
       LEFT JOIN categories c ON b.category_id = c.id
       ORDER BY b.created_at DESC`
    );
  },

  async getById(id) {
    const db = await getDatabase();
    return db.getFirstAsync('SELECT * FROM bookmarks WHERE id = ?', id);
  },

  async create({ title, url, icon_url, category_id, notes }) {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO bookmarks (title, url, icon_url, category_id, notes) VALUES (?, ?, ?, ?, ?)',
      title,
      url,
      icon_url ?? null,
      category_id ?? null,
      notes ?? null
    );
    return result.lastInsertRowId;
  },

  async update(id, { title, url, icon_url, category_id, notes }) {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE bookmarks
       SET title = ?, url = ?, icon_url = ?, category_id = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      title,
      url,
      icon_url ?? null,
      category_id ?? null,
      notes ?? null,
      id
    );
  },

  async remove(id) {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM bookmarks WHERE id = ?', id);
  },

  async search(query) {
    const db = await getDatabase();
    const likeQuery = `%${query}%`;
    return db.getAllAsync(
      `SELECT b.* FROM bookmarks b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.title LIKE ? OR c.name LIKE ?
       ORDER BY b.created_at DESC`,
      likeQuery,
      likeQuery
    );
  },

  async getByCategory(category_id) {
    const db = await getDatabase();
    return db.getAllAsync(
      'SELECT * FROM bookmarks WHERE category_id = ? ORDER BY created_at DESC',
      category_id
    );
  },

  async incrementVisit(id) {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE bookmarks
       SET visit_count = visit_count + 1, last_visited = datetime('now')
       WHERE id = ?`,
      id
    );
  },

  async deleteAll() {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM bookmarks');
  },
};
