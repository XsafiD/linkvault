// Inisialisasi koneksi SQLite untuk LinkVault
// Menggunakan expo-sqlite SDK 54 (async API)

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'linkvault.db';

let dbInstance = null;

export async function getDatabase() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await dbInstance.execAsync('PRAGMA journal_mode = WAL');
    await dbInstance.execAsync('PRAGMA foreign_keys = ON');
  }
  return dbInstance;
}

export async function closeDatabase() {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}
