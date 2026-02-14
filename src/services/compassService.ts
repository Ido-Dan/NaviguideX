import { Magnetometer } from 'expo-sensors';

export type HeadingCallback = (heading: number) => void;

let subscription: ReturnType<typeof Magnetometer.addListener> | null = null;
let filteredHeading = 0;

// Low-pass filter coefficient (0-1). Lower = smoother but slower response.
const SMOOTHING_FACTOR = 0.15;

/**
 * Calculate heading from magnetometer x/y values.
 * Returns degrees from north (0-360).
 */
function calculateHeading(x: number, y: number): number {
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  // Convert to compass heading (0 = North, clockwise)
  angle = (90 - angle + 360) % 360;
  return angle;
}

/**
 * Apply low-pass filter to heading to smooth out noise.
 * Handles the 360/0 wraparound correctly.
 */
function smoothHeading(newHeading: number, prevHeading: number): number {
  // Handle wraparound: find the shortest angular distance
  let diff = newHeading - prevHeading;
  if (diff > 180) {
    diff -= 360;
  }
  if (diff < -180) {
    diff += 360;
  }
  const smoothed = prevHeading + SMOOTHING_FACTOR * diff;
  return (smoothed + 360) % 360;
}

/**
 * Start listening to compass heading updates.
 * Calls the callback with smoothed heading in degrees (0 = north).
 */
export function startCompass(callback: HeadingCallback): void {
  if (subscription) {
    return; // Already listening
  }

  Magnetometer.setUpdateInterval(100); // 10 Hz

  subscription = Magnetometer.addListener((data) => {
    const rawHeading = calculateHeading(data.x, data.y);
    filteredHeading = smoothHeading(rawHeading, filteredHeading);
    callback(Math.round(filteredHeading));
  });
}

/**
 * Stop listening to compass updates.
 */
export function stopCompass(): void {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
  filteredHeading = 0;
}
