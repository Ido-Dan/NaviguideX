import { AppSettings } from '../types';
import { getDatabase } from './database';

const DEFAULT_SETTINGS: AppSettings = {
  mapSource: 'israel-hiking',
  units: 'metric',
  mapOrientation: 'north-up',
};

export function getSettings(): AppSettings {
  const db = getDatabase();
  const result = db.execute('SELECT key, value FROM settings');
  const rows = result.rows?._array ?? [];

  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    try {
      (settings as any)[row.key] = JSON.parse(row.value);
    } catch {
      (settings as any)[row.key] = row.value;
    }
  }
  return settings;
}

export function saveSetting(key: keyof AppSettings, value: any): void {
  const db = getDatabase();
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  db.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
    key,
    serialized,
  ]);
}

export function saveSettings(settings: Partial<AppSettings>): void {
  for (const [key, value] of Object.entries(settings)) {
    saveSetting(key as keyof AppSettings, value);
  }
}
