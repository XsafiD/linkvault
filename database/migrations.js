// Skema tabel & migrasi database LinkVault
// Menggunakan PRAGMA user_version untuk tracking versi

import { DEFAULT_CATEGORIES } from '../constants/categories';

const DATABASE_VERSION = 1;

export async function migrateDbIfNeeded(db) {
  const { user_version: currentDbVersion } = await db.getFirstAsync(
    'PRAGMA user_version'
  );

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        icon_url TEXT,
        category_id INTEGER,
        notes TEXT,
        visit_count INTEGER NOT NULL DEFAULT 0,
        last_visited TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category_id);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_created ON bookmarks(created_at);
    `);

    // Seeder kategori default
    for (const cat of DEFAULT_CATEGORIES) {
      await db.runAsync(
        'INSERT INTO categories (name, color) VALUES (?, ?)',
        cat.name,
        cat.color
      );
    }
  }

  // Tambah migrasi versi baru di sini:
  // if (currentDbVersion === 1) { ... }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
