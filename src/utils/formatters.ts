/**
 * Format distance for display.
 * Metric: shows km (or m for < 1km).
 * Imperial: converts to miles.
 */
export function formatDistance(
  km: number,
  units: 'metric' | 'imperial',
): string {
  if (units === 'imperial') {
    const miles = km * 0.621371;
    if (miles < 0.1) {
      const feet = Math.round(miles * 5280);
      return `${feet} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  }
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Format an ISO date string for display.
 * Returns a localized short date string.
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
