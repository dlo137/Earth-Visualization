import { useRef } from 'react';
import type { HandTrackingState } from '../types/handTracking';

interface TrackingWindowProps {
  trackingState?: HandTrackingState;
}

export default function TrackingWindow({ trackingState }: TrackingWindowProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  void trackingState;
  // TODO: implement
  return (
    <div>
      <video ref={videoRef} />
      <canvas ref={canvasRef} />
    </div>
  );
}
