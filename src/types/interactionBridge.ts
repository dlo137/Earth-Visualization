export interface NormalizedPointer {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
}

export interface InteractionFrame {
  pointer: NormalizedPointer;
  gesture: import('./gestures').GestureType;
  gestureStrength: number;
  rotationX: number;
  rotationY: number;
  disperseProgress: number;
}

export interface InteractionConfig {
  smoothingFactor: number;
  gestureDebounceMs: number;
  mirrorX: boolean;
}
