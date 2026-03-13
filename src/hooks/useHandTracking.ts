import { useEffect, useRef, useState } from 'react';
import type { Hands, Results } from '@mediapipe/hands';
import type { HandTrackingState } from '../types/handTracking';
import { FINGERTIP_INDICES } from '../constants/config';

const DEFAULT_STATE: HandTrackingState = {
  isDetected: false,
  handedness: null,
  fingertips: { thumb: null, index: null, middle: null, ring: null, pinky: null },
  rawLandmarks: [],
  confidence: 0,
  timestamp: 0,
};

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>): HandTrackingState {
  const [state, setState] = useState<HandTrackingState>(DEFAULT_STATE);
  const handsRef = useRef<Hands | null>(null);
  void handsRef;
  void setState;
  void videoRef;
  void FINGERTIP_INDICES;
  // TODO: implement
  return state;
}
