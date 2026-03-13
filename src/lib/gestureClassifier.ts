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
