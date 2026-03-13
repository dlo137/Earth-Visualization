/**
 * Converts MediaPipe normalized coordinates (0–1) to Three.js NDC (-1 to 1), flipping Y and optionally mirroring X.
 */
export function normalizeToNDC(
  x: number,
  y: number,
  mirrorX: boolean = true
): { x: number; y: number } {
  const ndcX = mirrorX ? 1 - x : x;
  return {
    x: ndcX * 2 - 1,
    y: -(y * 2 - 1),
  };
}

/**
 * Linearly interpolates between two 3D vectors by factor t (0–1).
 */
export function lerpV3(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  t: number
): { x: number; y: number; z: number } {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

import type { Landmark } from '../types/handTracking';

/**
 * Returns the frame-over-frame delta between two Landmarks, accounting for mirrorX on dx.
 */
export function fingertipDelta(
  current: Landmark,
  previous: Landmark,
  mirrorX: boolean = true
): { dx: number; dy: number } {
  const dx = mirrorX ? previous.x - current.x : current.x - previous.x;
  const dy = current.y - previous.y;
  return { dx, dy };
}

/**
 * Returns the Euclidean distance between two Landmarks in normalized space (3D).
 */
export function landmarkDistance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Returns the average pairwise distance between all Landmarks in the array.
 */
export function averageSpread(landmarks: Landmark[]): number {
  const n = landmarks.length;
  if (n < 2) return 0;
  let total = 0;
  let count = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      total += landmarkDistance(landmarks[i], landmarks[j]);
      count++;
    }
  }
  return count > 0 ? total / count : 0;
}

/**
 * Converts spherical coordinates to Cartesian (x, y, z).
 */
export function sphericalToCartesian(
  radius: number,
  phi: number,
  theta: number
): { x: number; y: number; z: number } {
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

/**
 * Smooths a value over time using exponential moving average (EMA).
 */
export function exponentialMovingAverage(
  previous: number,
  current: number,
  alpha: number
): number {
  return alpha * current + (1 - alpha) * previous;
}
