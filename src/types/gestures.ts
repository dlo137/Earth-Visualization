export type GestureType = 'IDLE' | 'ROTATE' | 'DISPERSE' | 'TIGHTEN' | 'PINCH';

export interface GestureConfig {
  disperseSpreadThreshold: number;
  tightenFistThreshold: number;
  pinchDistanceThreshold: number;
  rotateExtensionThreshold: number;
}

export interface GestureState {
  current: GestureType;
  previous: GestureType;
  confidence: number;
  enteredAt: number;
  durationMs: number;
}
