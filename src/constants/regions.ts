import { MapRegion } from '../types';

export const REGIONS: MapRegion[] = [
  {
    id: 'north',
    name: 'North',
    boundingBox: {
      minLat: 32.2,
      maxLat: 33.4,
      minLon: 34.9,
      maxLon: 35.9,
    },
    zoomRange: { min: 7, max: 16 },
    fileSizeBytes: 1_300_000_000, // ~64k tiles * ~20KB each
    status: 'not_downloaded',
    downloadProgress: 0,
  },
  {
    id: 'center',
    name: 'Center',
    boundingBox: {
      minLat: 31.2,
      maxLat: 32.2,
      minLon: 34.2,
      maxLon: 35.6,
    },
    zoomRange: { min: 7, max: 16 },
    fileSizeBytes: 1_500_000_000, // ~74k tiles * ~20KB each
    status: 'not_downloaded',
    downloadProgress: 0,
  },
  {
    id: 'south',
    name: 'South / Negev',
    boundingBox: {
      minLat: 29.4,
      maxLat: 31.2,
      minLon: 34.2,
      maxLon: 35.5,
    },
    zoomRange: { min: 7, max: 16 },
    fileSizeBytes: 2_400_000_000, // ~121k tiles * ~20KB each
    status: 'not_downloaded',
    downloadProgress: 0,
  },
];
