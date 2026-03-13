import { useEffect, useState } from 'react';
import type { FingertipState } from '../types/handTracking';
import type { GestureState } from '../types/gestures';
import { detectGesture } from '../lib/gestureClassifier';
import { DEFAULT_GESTURE_CONFIG } from '../constants/config';

const DEFAULT_STATE: GestureState = {
  current: 'IDLE',
  previous: 'IDLE',
  confidence: 0,
  enteredAt: 0,
  durationMs: 0,
};

export function useGesture(fingertips: FingertipState): GestureState {
  const [state, setState] = useState<GestureState>(DEFAULT_STATE);
  void detectGesture;
  void DEFAULT_GESTURE_CONFIG;
  void setState;
  void fingertips;
  // TODO: implement
  return state;
}
