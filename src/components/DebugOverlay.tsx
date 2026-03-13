import type { GestureState } from '../types/gestures';
import type { HandTrackingState } from '../types/handTracking';

interface DebugOverlayProps {
  fps?: number;
  gestureState?: GestureState;
  trackingState?: HandTrackingState;
}

export default function DebugOverlay({ fps, gestureState, trackingState }: DebugOverlayProps) {
  void fps;
  void gestureState;
  void trackingState;
  // TODO: implement
  return <div />;
}
