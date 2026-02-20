import * as FileSystem from 'expo-file-system/legacy';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { REGIONS } from '../constants/regions';
import { getDatabase } from '../storage/database';
import {
  calculateTiles,
  downloadTilesFromIndex,
  updateRegionStatus,
  deleteRegion as deleteTileFiles,
} from './tileService';

// --- State types ---

export interface RegionProgress {
  status: 'queued' | 'downloading' | 'paused' | 'downloaded' | 'not_downloaded';
  progress: number; // 0-100
  completedTiles: number;
  totalTiles: number;
}

export interface DownloadState {
  queue: string[];
  activeRegionId: string | null;
  regionProgress: Record<string, RegionProgress>;
  networkAvailable: boolean;
  isPaused: boolean;
}

type Listener = (state: DownloadState) => void;

// --- Singleton state ---

let state: DownloadState = {
  queue: [],
  activeRegionId: null,
  regionProgress: {},
  networkAvailable: true,
  isPaused: false,
};

const listeners = new Set<Listener>();
let abortController: AbortController | null = null;
let netInfoUnsubscribe: (() => void) | null = null;
let networkResumeTimer: ReturnType<typeof setTimeout> | null = null;

// --- Listener API ---

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDownloadState(): DownloadState {
  return state;
}

function notify(): void {
  for (const listener of listeners) {
    listener(state);
  }
}

function setState(partial: Partial<DownloadState>): void {
  state = { ...state, ...partial };
  notify();
}

function setRegionProgress(regionId: string, progress: RegionProgress): void {
  state = {
    ...state,
    regionProgress: {
      ...state.regionProgress,
      [regionId]: progress,
    },
  };
  notify();
}

// --- Public API ---

export function enqueueRegion(regionId: string): void {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return;

  // Already queued or downloading
  if (state.queue.includes(regionId) || state.activeRegionId === regionId) return;

  // Calculate total tiles
  const tiles = calculateTiles(region.boundingBox, region.zoomRange);
  const totalTiles = tiles.length;

  // Reset userCancelled flag in DB
  const db = getDatabase();
  db.execute(
    `INSERT OR REPLACE INTO map_regions (id, status, downloadProgress, completedTileIndex, totalTiles, userCancelled)
     VALUES (?, 'downloading', 0, 0, ?, 0)`,
    [regionId, totalTiles],
  );

  setRegionProgress(regionId, {
    status: 'queued',
    progress: 0,
    completedTiles: 0,
    totalTiles,
  });

  setState({ queue: [...state.queue, regionId] });
  processQueue();
}

export function cancelRegion(regionId: string): void {
  // If active, abort it
  if (state.activeRegionId === regionId) {
    abortController?.abort();
    abortController = null;

    // Mark as user-cancelled in DB
    const db = getDatabase();
    db.execute(
      "UPDATE map_regions SET userCancelled = 1, status = 'not_downloaded', downloadProgress = 0 WHERE id = ?",
      [regionId],
    );

    setRegionProgress(regionId, {
      status: 'not_downloaded',
      progress: 0,
      completedTiles: 0,
      totalTiles: state.regionProgress[regionId]?.totalTiles ?? 0,
    });

    setState({ activeRegionId: null });
    processQueue();
    return;
  }

  // If queued, remove from queue
  if (state.queue.includes(regionId)) {
    const db = getDatabase();
    db.execute(
      "UPDATE map_regions SET userCancelled = 1, status = 'not_downloaded', downloadProgress = 0 WHERE id = ?",
      [regionId],
    );

    setRegionProgress(regionId, {
      status: 'not_downloaded',
      progress: 0,
      completedTiles: 0,
      totalTiles: state.regionProgress[regionId]?.totalTiles ?? 0,
    });

    setState({ queue: state.queue.filter(id => id !== regionId) });
  }
}

export async function deleteRegionData(regionId: string): Promise<void> {
  // Cancel if active/queued first
  cancelRegion(regionId);

  // Delete tile files and reset DB status
  await deleteTileFiles(regionId);

  // Also reset checkpoint columns
  const db = getDatabase();
  db.execute(
    'UPDATE map_regions SET completedTileIndex = 0, totalTiles = 0, userCancelled = 0 WHERE id = ?',
    [regionId],
  );

  setRegionProgress(regionId, {
    status: 'not_downloaded',
    progress: 0,
    completedTiles: 0,
    totalTiles: 0,
  });
}

export function resumeIncompleteDownloads(): void {
  const db = getDatabase();
  const result = db.execute(
    "SELECT id FROM map_regions WHERE status = 'downloading' AND userCancelled = 0",
  );
  const rows = result.rows?._array ?? [];

  for (const row of rows) {
    const regionId = row.id as string;
    // Don't re-add if already active or queued
    if (state.activeRegionId === regionId || state.queue.includes(regionId)) continue;

    const region = REGIONS.find(r => r.id === regionId);
    if (!region) continue;

    // Read checkpoint from DB
    const checkpointResult = db.execute(
      'SELECT completedTileIndex, totalTiles FROM map_regions WHERE id = ?',
      [regionId],
    );
    const checkpointRows = checkpointResult.rows?._array ?? [];
    const completedTileIndex = checkpointRows.length > 0
      ? (checkpointRows[0].completedTileIndex as number) ?? 0
      : 0;
    const totalTiles = checkpointRows.length > 0
      ? (checkpointRows[0].totalTiles as number) ?? 0
      : calculateTiles(region.boundingBox, region.zoomRange).length;

    const progress = totalTiles > 0 ? Math.round((completedTileIndex / totalTiles) * 100) : 0;

    setRegionProgress(regionId, {
      status: 'queued',
      progress,
      completedTiles: completedTileIndex,
      totalTiles,
    });

    setState({ queue: [...state.queue, regionId] });
  }

  processQueue();
}

// --- Network monitoring ---

export function initNetworkMonitoring(): void {
  if (netInfoUnsubscribe) return; // Already initialized

  netInfoUnsubscribe = NetInfo.addEventListener((netState: NetInfoState) => {
    const wasAvailable = state.networkAvailable;
    const isAvailable = netState.isConnected === true && netState.isInternetReachable !== false;

    if (wasAvailable && !isAvailable) {
      // Network lost — pause
      abortController?.abort();
      setState({ networkAvailable: false, isPaused: true });
    } else if (!wasAvailable && isAvailable) {
      // Network restored — resume after delay
      setState({ networkAvailable: true });

      if (networkResumeTimer) clearTimeout(networkResumeTimer);
      networkResumeTimer = setTimeout(() => {
        networkResumeTimer = null;
        setState({ isPaused: false });
        processQueue();
      }, 2000);
    }
  });
}

export function stopNetworkMonitoring(): void {
  if (netInfoUnsubscribe) {
    netInfoUnsubscribe();
    netInfoUnsubscribe = null;
  }
  if (networkResumeTimer) {
    clearTimeout(networkResumeTimer);
    networkResumeTimer = null;
  }
}

// --- Download processing ---

function processQueue(): void {
  // Don't start if already active, paused, or queue empty
  if (state.activeRegionId || state.isPaused || state.queue.length === 0) return;

  const regionId = state.queue[0];
  const remaining = state.queue.slice(1);

  setState({ queue: remaining, activeRegionId: regionId });

  setRegionProgress(regionId, {
    ...state.regionProgress[regionId],
    status: 'downloading',
  });

  downloadRegionTiles(regionId);
}

async function downloadRegionTiles(regionId: string): Promise<void> {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) {
    setState({ activeRegionId: null });
    processQueue();
    return;
  }

  const tiles = calculateTiles(region.boundingBox, region.zoomRange);
  const totalTiles = tiles.length;

  // Read checkpoint from DB
  const db = getDatabase();
  const result = db.execute(
    'SELECT completedTileIndex FROM map_regions WHERE id = ?',
    [regionId],
  );
  const rows = result.rows?._array ?? [];
  let startIndex = rows.length > 0 ? (rows[0].completedTileIndex as number) ?? 0 : 0;

  // Overlap by one batch for crash safety
  startIndex = Math.max(0, startIndex - 40);

  // Ensure DB row exists with downloading status
  updateRegionStatus(regionId, 'downloading', state.regionProgress[regionId]?.progress ?? 0);

  abortController = new AbortController();

  let lastCheckpointPercent = -1;

  try {
    const { completedIndex, failed } = await downloadTilesFromIndex(
      regionId,
      tiles,
      startIndex,
      (completedIdx: number) => {
        const progress = Math.round((completedIdx / totalTiles) * 100);

        // Save checkpoint to DB every 1% change
        if (progress > lastCheckpointPercent) {
          lastCheckpointPercent = progress;
          db.execute(
            'UPDATE map_regions SET completedTileIndex = ?, downloadProgress = ? WHERE id = ?',
            [completedIdx, progress, regionId],
          );
        }

        setRegionProgress(regionId, {
          status: 'downloading',
          progress,
          completedTiles: completedIdx,
          totalTiles,
        });
      },
      abortController.signal,
    );

    abortController = null;

    // Check if aborted (network loss or cancellation)
    if (completedIndex < totalTiles && state.regionProgress[regionId]?.status !== 'not_downloaded') {
      // Was paused by network loss — checkpoint is already saved
      setRegionProgress(regionId, {
        ...state.regionProgress[regionId],
        status: 'paused',
      });
      setState({ activeRegionId: null });
      return;
    }

    // Allow up to 5% tile failures
    const failureRate = totalTiles > 0 ? failed / totalTiles : 0;
    if (failureRate > 0.05) {
      updateRegionStatus(regionId, 'not_downloaded', 0);
      setRegionProgress(regionId, {
        status: 'not_downloaded',
        progress: 0,
        completedTiles: 0,
        totalTiles,
      });
    } else {
      // Success
      const tilesDir = `${FileSystem.documentDirectory}tiles/${regionId}/`;
      updateRegionStatus(regionId, 'downloaded', 100, tilesDir);
      db.execute(
        'UPDATE map_regions SET completedTileIndex = ?, totalTiles = ? WHERE id = ?',
        [totalTiles, totalTiles, regionId],
      );
      setRegionProgress(regionId, {
        status: 'downloaded',
        progress: 100,
        completedTiles: totalTiles,
        totalTiles,
      });
    }
  } catch {
    // Download threw (e.g. abort) — checkpoint already saved
    if (state.regionProgress[regionId]?.status !== 'not_downloaded') {
      setRegionProgress(regionId, {
        ...state.regionProgress[regionId],
        status: 'paused',
      });
    }
  }

  setState({ activeRegionId: null });
  processQueue();
}
