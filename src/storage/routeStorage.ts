import { Route } from '../types';
import { getDatabase } from './database';

export function saveRoute(route: Route): void {
  const db = getDatabase();
  db.execute(
    `INSERT OR REPLACE INTO routes
      (id, name, fileName, importDate, totalDistanceKm, waypointCount,
       minLat, maxLat, minLon, maxLon, gpxRaw, trackPointsJson, waypointsJson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      route.id,
      route.name,
      route.fileName,
      route.importDate,
      route.totalDistanceKm,
      route.waypointCount,
      route.boundingBox.minLat,
      route.boundingBox.maxLat,
      route.boundingBox.minLon,
      route.boundingBox.maxLon,
      route.gpxRaw,
      JSON.stringify(route.trackPoints),
      JSON.stringify(route.waypoints),
    ],
  );
}

export function getAllRoutes(): Route[] {
  const db = getDatabase();
  const result = db.execute('SELECT * FROM routes ORDER BY importDate DESC');
  const rows = result.rows?._array ?? [];
  return rows.map(rowToRoute);
}

export function getRouteById(id: string): Route | null {
  const db = getDatabase();
  const result = db.execute('SELECT * FROM routes WHERE id = ?', [id]);
  const rows = result.rows?._array ?? [];
  if (rows.length === 0) {
    return null;
  }
  return rowToRoute(rows[0]);
}

export function deleteRoute(id: string): void {
  const db = getDatabase();
  db.execute('DELETE FROM routes WHERE id = ?', [id]);
}

function rowToRoute(row: any): Route {
  return {
    id: row.id,
    name: row.name,
    fileName: row.fileName,
    importDate: row.importDate,
    totalDistanceKm: row.totalDistanceKm,
    waypointCount: row.waypointCount,
    boundingBox: {
      minLat: row.minLat,
      maxLat: row.maxLat,
      minLon: row.minLon,
      maxLon: row.maxLon,
    },
    gpxRaw: row.gpxRaw,
    trackPoints: JSON.parse(row.trackPointsJson),
    waypoints: JSON.parse(row.waypointsJson),
  };
}
