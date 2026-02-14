import * as FileSystem from 'expo-file-system';
import { MapRegion } from '../types';
import { REGIONS } from '../constants/regions';
import { getDatabase } from '../storage/database';

const TILES_DIR = `${FileSystem.documentDirectory}tiles`;

type ProgressCallback = (regionId: string, progress: number) => void;

/**
 * Get the local file path for a region's MBTiles file.
 */
function regionFilePath(regionId: string): string {
  return `${TILES_DIR}/${regionId}.mbtiles`;
}

/**
 * Ensure the tiles directory exists.
 */
async function ensureTilesDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(TILES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(TILES_DIR, { intermediates: true });
  }
}

/**
 * Get all regions with their current download status from the database.
 */
export function getRegionsWithStatus(): MapRegion[] {
  const db = getDatabase();
  const result = db.execute('SELECT * FROM map_regions');
  const rows = result.rows?._array ?? [];
  const statusMap = new Map<string, any>();
  for (const row of rows) {
    statusMap.set(row.id, row);
  }

  return REGIONS.map(region => {
    const dbRow = statusMap.get(region.id);
    if (dbRow) {
      return {
        ...region,
        status: dbRow.status,
        localFilePath: dbRow.localFilePath || undefined,
        downloadProgress: dbRow.downloadProgress,
      };
    }
    return region;
  });
}

/**
 * Download a region's MBTiles file.
 */
export async function downloadRegion(
  regionId: string,
  onProgress?: ProgressCallback,
): Promise<void> {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) {
    throw new Error(`Unknown region: ${regionId}`);
  }

  await ensureTilesDir();
  const filePath = regionFilePath(regionId);

  // Update status to downloading
  updateRegionStatus(regionId, 'downloading', 0);

  const downloadResumable = FileSystem.createDownloadResumable(
    region.downloadUrl,
    filePath,
    {},
    (downloadProgress) => {
      const progress = Math.round(
        (downloadProgress.totalBytesWritten / region.fileSizeBytes) * 100,
      );
      updateRegionStatus(regionId, 'downloading', progress);
      onProgress?.(regionId, progress);
    },
  );

  const result = await downloadResumable.downloadAsync();
  if (result && result.status === 200) {
    updateRegionStatus(regionId, 'downloaded', 100, filePath);
  } else {
    // Clean up partial file
    const info = await FileSystem.getInfoAsync(filePath);
    if (info.exists) {
      await FileSystem.deleteAsync(filePath);
    }
    updateRegionStatus(regionId, 'not_downloaded', 0);
    throw new Error(`Download failed with status ${result?.status}`);
  }
}

/**
 * Delete a downloaded region's MBTiles file.
 */
export async function deleteRegion(regionId: string): Promise<void> {
  const filePath = regionFilePath(regionId);
  const info = await FileSystem.getInfoAsync(filePath);
  if (info.exists) {
    await FileSystem.deleteAsync(filePath);
  }
  updateRegionStatus(regionId, 'not_downloaded', 0);
}

/**
 * Get the local file path for a downloaded region (or undefined if not downloaded).
 */
export function getRegionFilePath(regionId: string): string | undefined {
  const db = getDatabase();
  const result = db.execute(
    'SELECT localFilePath FROM map_regions WHERE id = ? AND status = ?',
    [regionId, 'downloaded'],
  );
  const rows = result.rows?._array ?? [];
  return rows.length > 0 ? rows[0].localFilePath : undefined;
}

function updateRegionStatus(
  regionId: string,
  status: string,
  progress: number,
  localFilePath?: string,
): void {
  const db = getDatabase();
  db.execute(
    `INSERT OR REPLACE INTO map_regions (id, status, downloadProgress, localFilePath)
     VALUES (?, ?, ?, ?)`,
    [regionId, status, progress, localFilePath || null],
  );
}
