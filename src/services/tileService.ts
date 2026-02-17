import * as FileSystem from 'expo-file-system/legacy';
import { MapRegion, BoundingBox } from '../types';
import { REGIONS } from '../constants/regions';
import { TILE_SERVER_URL } from '../constants/mapConfig';
import { getDatabase } from '../storage/database';

const TILES_BASE = `${FileSystem.documentDirectory}tiles/`;
const CONCURRENT_DOWNLOADS = 6;

type ProgressCallback = (regionId: string, progress: number) => void;

// Track cancelled downloads so in-flight requests can bail out
const cancelledDownloads = new Set<string>();

/**
 * Convert longitude to tile X coordinate at a given zoom level.
 */
function lon2tile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

/**
 * Convert latitude to tile Y coordinate at a given zoom level.
 */
function lat2tile(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom),
  );
}

interface TileCoord {
  z: number;
  x: number;
  y: number;
}

/**
 * Calculate all tile coordinates needed for a bounding box and zoom range.
 */
function calculateTiles(
  bbox: BoundingBox,
  zoomRange: { min: number; max: number },
): TileCoord[] {
  const tiles: TileCoord[] = [];
  for (let z = zoomRange.min; z <= zoomRange.max; z++) {
    const xMin = lon2tile(bbox.minLon, z);
    const xMax = lon2tile(bbox.maxLon, z);
    // Note: lat2tile is inverted (higher lat = lower y)
    const yMin = lat2tile(bbox.maxLat, z);
    const yMax = lat2tile(bbox.minLat, z);
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        tiles.push({ z, x, y });
      }
    }
  }
  return tiles;
}

/**
 * Get the local file URI for a single tile.
 */
function tileFileUri(regionId: string, z: number, x: number, y: number): string {
  return `${TILES_BASE}${regionId}/${z}/${x}/${y}.png`;
}

/**
 * Get the base directory URI for a region's tiles.
 */
function regionDirUri(regionId: string): string {
  return `${TILES_BASE}${regionId}/`;
}

/**
 * Build the remote URL for a tile from the Israel Hiking tile server.
 */
function tileUrl(z: number, x: number, y: number): string {
  return TILE_SERVER_URL.replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y));
}

/**
 * Ensure a directory exists, creating intermediates as needed.
 */
async function ensureDir(dirUri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(dirUri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
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
    statusMap.set(row.id as string, row);
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
 * Download a single tile, skipping if it already exists on disk.
 */
async function downloadTile(
  regionId: string,
  tile: TileCoord,
): Promise<boolean> {
  const destUri = tileFileUri(regionId, tile.z, tile.x, tile.y);

  const info = await FileSystem.getInfoAsync(destUri);
  if (info.exists) {
    return true; // Already cached
  }

  // Ensure parent directory exists
  const parentUri = `${TILES_BASE}${regionId}/${tile.z}/${tile.x}/`;
  await ensureDir(parentUri);

  const url = tileUrl(tile.z, tile.x, tile.y);
  try {
    await FileSystem.downloadAsync(url, destUri);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download all tiles for a region with concurrency control.
 */
export async function downloadRegion(
  regionId: string,
  onProgress?: ProgressCallback,
): Promise<void> {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) {
    throw new Error(`Unknown region: ${regionId}`);
  }

  cancelledDownloads.delete(regionId);
  await ensureDir(regionDirUri(regionId));

  const tiles = calculateTiles(region.boundingBox, region.zoomRange);
  const totalTiles = tiles.length;
  let completedTiles = 0;
  let failedTiles = 0;

  updateRegionStatus(regionId, 'downloading', 0);

  // Process tiles in batches for concurrency control
  let i = 0;
  while (i < totalTiles) {
    if (cancelledDownloads.has(regionId)) {
      cancelledDownloads.delete(regionId);
      updateRegionStatus(regionId, 'not_downloaded', 0);
      throw new Error('Download cancelled');
    }

    const batch = tiles.slice(i, i + CONCURRENT_DOWNLOADS);
    const results = await Promise.allSettled(
      batch.map(tile => downloadTile(regionId, tile)),
    );

    for (const result of results) {
      if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value)) {
        failedTiles++;
      }
      completedTiles++;
    }

    const progress = Math.round((completedTiles / totalTiles) * 100);
    updateRegionStatus(regionId, 'downloading', progress);
    onProgress?.(regionId, progress);

    i += CONCURRENT_DOWNLOADS;
  }

  // Allow up to 5% tile failures (some tiles may be outside the actual map coverage)
  const failureRate = failedTiles / totalTiles;
  if (failureRate > 0.05) {
    updateRegionStatus(regionId, 'not_downloaded', 0);
    throw new Error(
      `Download failed: ${failedTiles} of ${totalTiles} tiles could not be downloaded`,
    );
  }

  updateRegionStatus(regionId, 'downloaded', 100, regionDirUri(regionId));
}

/**
 * Cancel an in-progress download for a region.
 */
export function cancelDownload(regionId: string): void {
  cancelledDownloads.add(regionId);
}

/**
 * Delete a downloaded region's tile files.
 */
export async function deleteRegion(regionId: string): Promise<void> {
  const dirUri = regionDirUri(regionId);
  const info = await FileSystem.getInfoAsync(dirUri);
  if (info.exists) {
    await FileSystem.deleteAsync(dirUri, { idempotent: true });
  }
  updateRegionStatus(regionId, 'not_downloaded', 0);
}

/**
 * Get the local tiles directory URI for a downloaded region (or undefined if not downloaded).
 */
export function getRegionFilePath(regionId: string): string | undefined {
  const db = getDatabase();
  const result = db.execute(
    'SELECT localFilePath FROM map_regions WHERE id = ? AND status = ?',
    [regionId, 'downloaded'],
  );
  const rows = result.rows?._array ?? [];
  return rows.length > 0 ? (rows[0].localFilePath as string) ?? undefined : undefined;
}

/**
 * Get the tiles directory URI (used by MapView to construct local tile URLs).
 */
export function getTilesDir(): string {
  return TILES_BASE;
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
