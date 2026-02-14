import { Route, TrackPoint, Waypoint, BoundingBox } from '../types';
import { totalTrackDistance } from '../utils/geo';

/**
 * Parse GPX XML string into a Route object.
 * Handles <trk>/<trkseg>, <rte>/<rtept>, and <wpt> variants.
 */
export function parseGpx(
  gpxXml: string,
  fileName: string,
): Route {
  const name = extractName(gpxXml) || fileName.replace(/\.gpx$/i, '');
  const trackPoints = parseTrackPoints(gpxXml);
  const routePoints = parseRoutePoints(gpxXml);
  const waypoints = parseWaypoints(gpxXml);

  // Use track points if available, otherwise use route points
  const points = trackPoints.length > 0 ? trackPoints : routePoints;

  const boundingBox = calculateBoundingBox(points, waypoints);
  const totalDistanceKm = totalTrackDistance(points);

  return {
    id: generateId(),
    name,
    fileName,
    importDate: new Date().toISOString(),
    totalDistanceKm,
    waypointCount: waypoints.length,
    boundingBox,
    gpxRaw: gpxXml,
    trackPoints: points,
    waypoints,
  };
}

function extractName(xml: string): string | null {
  // Try <metadata><name> first, then <trk><name>, then <rte><name>
  const metaMatch = xml.match(/<metadata[^>]*>[\s\S]*?<name>([\s\S]*?)<\/name>/);
  if (metaMatch) {
    return metaMatch[1].trim();
  }
  const trkMatch = xml.match(/<trk[^>]*>\s*<name>([\s\S]*?)<\/name>/);
  if (trkMatch) {
    return trkMatch[1].trim();
  }
  const rteMatch = xml.match(/<rte[^>]*>\s*<name>([\s\S]*?)<\/name>/);
  if (rteMatch) {
    return rteMatch[1].trim();
  }
  return null;
}

/**
 * Parse <trk><trkseg><trkpt> elements.
 */
function parseTrackPoints(xml: string): TrackPoint[] {
  const points: TrackPoint[] = [];
  const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*(?:\/>|>([\s\S]*?)<\/trkpt>)/g;
  let match;
  while ((match = trkptRegex.exec(xml)) !== null) {
    points.push(parsePointAttributes(match[1], match[2], match[3]));
  }
  return points;
}

/**
 * Parse <rte><rtept> elements.
 */
function parseRoutePoints(xml: string): TrackPoint[] {
  const points: TrackPoint[] = [];
  const rteptRegex = /<rtept\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*(?:\/>|>([\s\S]*?)<\/rtept>)/g;
  let match;
  while ((match = rteptRegex.exec(xml)) !== null) {
    points.push(parsePointAttributes(match[1], match[2], match[3]));
  }
  return points;
}

/**
 * Parse <wpt> elements.
 */
function parseWaypoints(xml: string): Waypoint[] {
  const waypoints: Waypoint[] = [];
  const wptRegex = /<wpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*(?:\/>|>([\s\S]*?)<\/wpt>)/g;
  let match;
  while ((match = wptRegex.exec(xml)) !== null) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    const inner = match[3] || '';
    const ele = extractFloat(inner, 'ele');
    const name = extractText(inner, 'name');
    const description =
      extractText(inner, 'desc') || extractText(inner, 'cmt');
    waypoints.push({ lat, lon, ele, name, description });
  }
  return waypoints;
}

function parsePointAttributes(
  latStr: string,
  lonStr: string,
  innerXml?: string,
): TrackPoint {
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  const inner = innerXml || '';
  const ele = extractFloat(inner, 'ele');
  const time = extractText(inner, 'time') || undefined;
  return { lat, lon, ele, time };
}

function extractFloat(xml: string, tag: string): number | undefined {
  const match = xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
  if (match) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? undefined : val;
  }
  return undefined;
}

function extractText(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : undefined;
}

function calculateBoundingBox(
  points: TrackPoint[],
  waypoints: Waypoint[],
): BoundingBox {
  const allLats = [
    ...points.map(p => p.lat),
    ...waypoints.map(w => w.lat),
  ];
  const allLons = [
    ...points.map(p => p.lon),
    ...waypoints.map(w => w.lon),
  ];

  if (allLats.length === 0) {
    return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };
  }

  return {
    minLat: Math.min(...allLats),
    maxLat: Math.max(...allLats),
    minLon: Math.min(...allLons),
    maxLon: Math.max(...allLons),
  };
}

function generateId(): string {
  // Simple UUID v4 generator (no external dependency)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
