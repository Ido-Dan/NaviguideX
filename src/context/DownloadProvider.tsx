import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import type { MapRegion } from '../types';
import { REGIONS } from '../constants/regions';
import {
  subscribe,
  getDownloadState,
  enqueueRegion,
  cancelRegion,
  deleteRegionData,
  DownloadState,
} from '../services/downloadManager';
import { getRegionsWithStatus } from '../services/tileService';

interface DownloadContextValue {
  regions: MapRegion[];
  isDownloading: boolean;
  activeRegionId: string | null;
  networkAvailable: boolean;
  downloadRegion: (regionId: string) => void;
  cancelDownload: (regionId: string) => void;
  deleteRegion: (regionId: string) => Promise<void>;
}

const DownloadContext = createContext<DownloadContextValue | null>(null);

export function useDownload(): DownloadContextValue {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within DownloadProvider');
  }
  return context;
}

interface DownloadProviderProps {
  children: ReactNode;
}

export function DownloadProvider({ children }: DownloadProviderProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>(getDownloadState);
  const rafRef = useRef<number | null>(null);
  const pendingStateRef = useRef<DownloadState | null>(null);

  // Subscribe to download manager with RAF throttling
  useEffect(() => {
    const unsubscribe = subscribe((newState: DownloadState) => {
      pendingStateRef.current = newState;

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          if (pendingStateRef.current) {
            setDownloadState(pendingStateRef.current);
            pendingStateRef.current = null;
          }
        });
      }
    });

    return () => {
      unsubscribe();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Merge REGIONS static data with live download state
  const regions: MapRegion[] = React.useMemo(() => {
    // Get DB status for regions not actively managed by download manager
    const dbRegions = getRegionsWithStatus();
    const dbMap = new Map(dbRegions.map(r => [r.id, r]));

    return REGIONS.map(region => {
      const liveProgress = downloadState.regionProgress[region.id];
      if (liveProgress) {
        return {
          ...region,
          status: liveProgress.status,
          downloadProgress: liveProgress.progress,
        };
      }

      // Fall back to DB state
      const dbRegion = dbMap.get(region.id);
      if (dbRegion) {
        return dbRegion;
      }

      return region;
    });
  }, [downloadState]);

  const handleDownload = useCallback((regionId: string) => {
    enqueueRegion(regionId);
  }, []);

  const handleCancel = useCallback((regionId: string) => {
    cancelRegion(regionId);
  }, []);

  const handleDelete = useCallback(async (regionId: string) => {
    await deleteRegionData(regionId);
  }, []);

  const value: DownloadContextValue = {
    regions,
    isDownloading: downloadState.activeRegionId !== null,
    activeRegionId: downloadState.activeRegionId,
    networkAvailable: downloadState.networkAvailable,
    downloadRegion: handleDownload,
    cancelDownload: handleCancel,
    deleteRegion: handleDelete,
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
}
