import type { FingertipState, Landmark } from '../types/handTracking';
import type { GestureType, GestureConfig } from '../types/gestures';
import { averageSpread, landmarkDistance } from './mathUtils';
import { DEFAULT_GESTURE_CONFIG } from '../constants/config';

/**
 * Converts FingertipState into a Landmark array, filtering out nulls.
 */
function getFingertipsAsArray(fingertips: FingertipState): Landmark[] {
  return Object.values(fingertips).filter((lm): lm is Landmark => lm !== null);
}

/**
 * Returns true if all 5 fingertips are present and averageSpread exceeds threshold.
 */
function isOpenPalm(fingertips: FingertipState, config: GestureConfig): boolean {
  const arr = getFingertipsAsArray(fingertips);
  return arr.length === 5 && averageSpread(arr) > config.disperseSpreadThreshold;
}

/**
 * Returns true if all 5 fingertips are present and averageSpread is below threshold.
 */
function isClosedFist(fingertips: FingertipState, config: GestureConfig): boolean {
  const arr = getFingertipsAsArray(fingertips);
  return arr.length === 5 && averageSpread(arr) < config.tightenFistThreshold;
}

/**
 * Returns true if thumb and index are present and close together.
 */
function isPinch(fingertips: FingertipState, config: GestureConfig): boolean {
  const thumb = fingertips.thumb;
  const index = fingertips.index;
  return (
    !!thumb &&
    !!index &&
    landmarkDistance(thumb, index) < config.pinchDistanceThreshold
  );
}

/**
 * Returns true if index is present, not pinching, and spread is between thresholds.
 */
function isPointing(fingertips: FingertipState, config: GestureConfig): boolean {
  const arr = getFingertipsAsArray(fingertips);
  const index = fingertips.index;
  if (!index || isPinch(fingertips, config)) return false;
  const spread = averageSpread(arr);
  return (
    arr.length === 5 &&
    spread >= config.tightenFistThreshold &&
    spread <= config.disperseSpreadThreshold
  );
}

/**
 * Returns a 0–1 confidence score for a given gesture and fingertip spread.
 */
export function gestureConfidence(
  gesture: GestureType,
  fingertips: FingertipState,
  config: GestureConfig
): number {
  const arr = getFingertipsAsArray(fingertips);
  const spread = arr.length === 5 ? averageSpread(arr) : 0;
  switch (gesture) {
    case 'DISPERSE':
      return Math.max(0, Math.min(1, spread / config.disperseSpreadThreshold));
    case 'TIGHTEN':
      return Math.max(0, Math.min(1, 1 - spread / config.tightenFistThreshold));
    case 'ROTATE':
    case 'PINCH':
      return 1.0;
    case 'IDLE':
    default:
      return 0.0;
  }
}

/**
 * Detects the current gesture from fingertip data and config, in priority order.
 */
export function detectGesture(
  fingertips: FingertipState,
  config: GestureConfig = DEFAULT_GESTURE_CONFIG
): GestureType {
  if (isPinch(fingertips, config)) return 'PINCH';
  if (isOpenPalm(fingertips, config)) return 'DISPERSE';
  if (isClosedFist(fingertips, config)) return 'TIGHTEN';
  if (isPointing(fingertips, config)) return 'ROTATE';
  return 'IDLE';
}
import type { FingertipState } from '../types/handTracking';
import type { GestureType, GestureConfig } from '../types/gestures';
import { DEFAULT_GESTURE_CONFIG } from '../constants/config';

export function detectGesture(
  fingertips: FingertipState,
  config: GestureConfig = DEFAULT_GESTURE_CONFIG
): GestureType {
  void fingertips;
  void config;
  // TODO: implement
  return 'IDLE';
}
