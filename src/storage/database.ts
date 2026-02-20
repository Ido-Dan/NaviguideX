import { open, NitroSQLiteConnection } from 'react-native-nitro-sqlite';

const DB_NAME = 'naviguidex.db';

let db: NitroSQLiteConnection | null = null;

export function getDatabase(): NitroSQLiteConnection {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function initDatabase(): void {
  db = open({ name: DB_NAME });

  // Enable WAL mode for better performance
  db.execute('PRAGMA journal_mode = WAL;');

  // Run migrations
  createTables(db);
  runMigrations(db);
}

function createTables(database: NitroSQLiteConnection): void {
  database.execute(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      fileName TEXT NOT NULL,
      importDate TEXT NOT NULL,
      totalDistanceKm REAL NOT NULL,
      waypointCount INTEGER NOT NULL,
      minLat REAL NOT NULL,
      maxLat REAL NOT NULL,
      minLon REAL NOT NULL,
      maxLon REAL NOT NULL,
      gpxRaw TEXT NOT NULL,
      trackPointsJson TEXT NOT NULL,
      waypointsJson TEXT NOT NULL
    );
  `);

  database.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  database.execute(`
    CREATE TABLE IF NOT EXISTS map_regions (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'not_downloaded',
      localFilePath TEXT,
      downloadProgress REAL NOT NULL DEFAULT 0
    );
  `);
}

function getDbVersion(database: NitroSQLiteConnection): number {
  const result = database.execute(
    "SELECT value FROM settings WHERE key = '_db_version'",
  );
  const rows = result.rows?._array ?? [];
  return rows.length > 0 ? parseInt(rows[0].value as string, 10) : 0;
}

function setDbVersion(database: NitroSQLiteConnection, version: number): void {
  database.execute(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('_db_version', ?)",
    [String(version)],
  );
}

function runMigrations(database: NitroSQLiteConnection): void {
  const currentVersion = getDbVersion(database);

  if (currentVersion < 1) {
    // Add checkpoint columns for resumable downloads
    try {
      database.execute(
        'ALTER TABLE map_regions ADD COLUMN completedTileIndex INTEGER NOT NULL DEFAULT 0',
      );
    } catch {
      // Column may already exist
    }
    try {
      database.execute(
        'ALTER TABLE map_regions ADD COLUMN totalTiles INTEGER NOT NULL DEFAULT 0',
      );
    } catch {
      // Column may already exist
    }
    try {
      database.execute(
        'ALTER TABLE map_regions ADD COLUMN userCancelled INTEGER NOT NULL DEFAULT 0',
      );
    } catch {
      // Column may already exist
    }
    setDbVersion(database, 1);
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
