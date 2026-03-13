import { useState, useEffect, useRef } from 'react';
import type { HandTrackingState } from '../types/handTracking';
import type { GestureState, GestureConfig } from '../types/gestures';
import type { GestureType } from '../types/gestures';
import { detectGesture, gestureConfidence } from '../lib/gestureClassifier';
import { DEFAULT_GESTURE_CONFIG } from '../constants/config';

/**
 * React hook to classify hand gestures with debouncing and duration tracking.
 */
export function useGesture(
  tracking: HandTrackingState,
  config: GestureConfig = DEFAULT_GESTURE_CONFIG
): GestureState {
  const [gestureState, setGestureState] = useState<GestureState>({
    current: 'IDLE',
    previous: 'IDLE',
    confidence: 0,
    enteredAt: 0,
    durationMs: 0,
  });

  const pendingGestureRef = useRef<GestureType>('IDLE');
  const pendingGestureStartRef = useRef<number>(0);

  useEffect(() => {
    let rawGesture: GestureType = 'IDLE';
    if (tracking.isDetected) {
      rawGesture = detectGesture(tracking.fingertips, config);
    }

    // If hand is lost, immediately return to IDLE
    if (!tracking.isDetected && gestureState.current !== 'IDLE') {
      setGestureState((prev) => ({
        current: 'IDLE',
        previous: prev.current,
        confidence: 0,
        enteredAt: performance.now(),
        durationMs: 0,
      }));
      pendingGestureRef.current = 'IDLE';
      pendingGestureStartRef.current = performance.now();
      return;
    }

    if (rawGesture !== pendingGestureRef.current) {
      pendingGestureRef.current = rawGesture;
      pendingGestureStartRef.current = performance.now();
    }

    const heldFor = performance.now() - pendingGestureStartRef.current;
    if (
      heldFor >= config.gestureDebounceMs &&
      rawGesture !== gestureState.current
    ) {
      setGestureState((prev) => ({
        current: rawGesture,
        previous: prev.current,
        confidence: gestureConfidence(rawGesture, tracking.fingertips, config),
        enteredAt: performance.now(),
        durationMs: 0,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking, config.gestureDebounceMs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGestureState((prev) => ({
        ...prev,
        durationMs: prev.enteredAt ? performance.now() - prev.enteredAt : 0,
      }));
    }, 100);
    return () => clearInterval(interval);
  }, [gestureState.enteredAt]);

  return gestureState;
}
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
