export interface Route {
  id: string;
  name: string;
  fileName: string;
  importDate: string;
  totalDistanceKm: number;
  waypointCount: number;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  gpxRaw: string;
  trackPoints: TrackPoint[];
  waypoints: Waypoint[];
}

export interface TrackPoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: string;
}

export interface Waypoint {
  lat: number;
  lon: number;
  ele?: number;
  name?: string;
  description?: string;
}

export interface MapRegion {
  id: string;
  name: string;
  boundingBox: BoundingBox;
  zoomRange: { min: number; max: number };
  downloadUrl: string;
  localFilePath?: string;
  fileSizeBytes: number;
  status: 'not_downloaded' | 'downloading' | 'downloaded';
  downloadProgress: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface AppSettings {
  mapSource: 'israel-hiking';
  units: 'metric' | 'imperial';
  mapOrientation: 'north-up' | 'heading-up';
  lastMapCenter?: { lat: number; lon: number };
  lastMapZoom?: number;
}

export interface NavigationState {
  activeRoute: Route | null;
  userPosition: {
    lat: number;
    lon: number;
    accuracy: number;
    heading: number;
    speed?: number;
  } | null;
  mapOrientation: 'north-up' | 'heading-up';
  isFollowingUser: boolean;
}
