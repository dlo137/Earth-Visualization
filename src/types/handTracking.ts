export const FINGERTIP_INDICES = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
} as const;

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface FingertipState {
  thumb: Landmark | null;
  index: Landmark | null;
  middle: Landmark | null;
  ring: Landmark | null;
  pinky: Landmark | null;
}

export interface HandTrackingState {
  isDetected: boolean;
  handedness: 'Left' | 'Right' | null;
  fingertips: FingertipState;
  rawLandmarks: Landmark[];
  confidence: number;
  timestamp: number;
}
