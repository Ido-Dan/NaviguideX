import * as Location from 'expo-location';

export type LocationUpdate = {
  lat: number;
  lon: number;
  accuracy: number;
  heading: number;
  speed?: number;
};

type LocationCallback = (update: LocationUpdate) => void;

let subscription: Location.LocationSubscription | null = null;

/**
 * Request foreground location permission.
 * Returns true if granted, false otherwise.
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Start GPS tracking with ~1-2 second update interval.
 * Calls the callback with each position update.
 */
export async function startTracking(
  callback: LocationCallback,
): Promise<void> {
  if (subscription) {
    return; // Already tracking
  }

  const granted = await requestLocationPermission();
  if (!granted) {
    throw new Error('Location permission not granted');
  }

  subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1500,
      distanceInterval: 1,
    },
    (location) => {
      callback({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        accuracy: location.coords.accuracy ?? 0,
        heading: location.coords.heading ?? 0,
        speed: location.coords.speed ?? undefined,
      });
    },
  );
}

/**
 * Stop GPS tracking and remove the subscription.
 */
export function stopTracking(): void {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
}

/**
 * Get current position once.
 */
export async function getCurrentPosition(): Promise<LocationUpdate> {
  const granted = await requestLocationPermission();
  if (!granted) {
    throw new Error('Location permission not granted');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
  });

  return {
    lat: location.coords.latitude,
    lon: location.coords.longitude,
    accuracy: location.coords.accuracy ?? 0,
    heading: location.coords.heading ?? 0,
    speed: location.coords.speed ?? undefined,
  };
}
