export interface NormalizedPointer {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
}

export interface InteractionFrame {
  pointer: NormalizedPointer;
  gesture: import('./gestures').GestureType;
  previousGesture: import('./gestures').GestureType;
  gestureStrength: number;
  rotationX: number;
  rotationY: number;
  disperseProgress: number;
  handsDetected: boolean;
  isZoomMode: boolean;
  zoomScale: number;
  isSelected: boolean;
}

export interface InteractionConfig {
  smoothingFactor: number;
  gestureDebounceMs: number;
  mirrorX: boolean;
}
