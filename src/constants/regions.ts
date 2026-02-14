import { MapRegion } from '../types';

// Base URL placeholder for hosted MBTiles files
const MBTILES_BASE_URL = 'https://tiles.naviguidex.app/regions';

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
    downloadUrl: `${MBTILES_BASE_URL}/north.mbtiles`,
    fileSizeBytes: 1_000_000_000,
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
    downloadUrl: `${MBTILES_BASE_URL}/center.mbtiles`,
    fileSizeBytes: 800_000_000,
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
    downloadUrl: `${MBTILES_BASE_URL}/south.mbtiles`,
    fileSizeBytes: 1_000_000_000,
    status: 'not_downloaded',
    downloadProgress: 0,
  },
];
