import { useEffect, useRef } from 'react';
import { useAppState } from '../context/AppStateContext';
import { FINGERTIP_INDICES } from '../constants/config';

const GESTURE_COLORS: Record<string, string> = {
  IDLE: 'rgba(255,255,255,0.4)',
  ROTATE: '#60a5fa',
  DISPERSE: '#f97316',
  TIGHTEN: '#a78bfa',
  PINCH: '#34d399',
};

const FINGERTIP_COLORS: Record<keyof typeof FINGERTIP_INDICES, string> = {
  thumb: '#f97316',
  index: '#60a5fa',
  middle: '#a78bfa',
  ring: '#34d399',
  pinky: '#fb7185',
};

const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17]
];

export default function TrackingWindow() {
  const { videoRef, tracking, gesture } = useAppState();
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
    if (!ctx) return;
    // Match canvas size to display size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!tracking.isDetected) return;

    // Draw hand skeleton connections
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    for (const [a, b] of HAND_CONNECTIONS) {
      const la = tracking.rawLandmarks[a];
      const lb = tracking.rawLandmarks[b];
      if (!la || !lb) continue;
      const ax = canvas.width - la.x * canvas.width;
      const ay = la.y * canvas.height;
      const bx = canvas.width - lb.x * canvas.width;
      const by = lb.y * canvas.height;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    ctx.restore();

    // Draw all 21 landmarks as small dots
    for (const lm of tracking.rawLandmarks) {
      const x = canvas.width - lm.x * canvas.width;
      const y = lm.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();
    }

    // Draw 5 fingertips as larger colored dots
    for (const name in FINGERTIP_INDICES) {
      const idx = FINGERTIP_INDICES[name as keyof typeof FINGERTIP_INDICES];
      const lm = tracking.rawLandmarks[idx];
      if (!lm) continue;
      const x = canvas.width - lm.x * canvas.width;
      const y = lm.y * canvas.height;
      // Outer ring
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, 2 * Math.PI);
      ctx.strokeStyle = FINGERTIP_COLORS[name as keyof typeof FINGERTIP_INDICES];
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = FINGERTIP_COLORS[name as keyof typeof FINGERTIP_INDICES];
      ctx.fill();
    }
  }, [tracking]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 280,
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#000',
        zIndex: 1000,
        boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '6px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Hand Tracking</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: tracking.isDetected ? '#00ff88' : '#ff4444',
              boxShadow: `0 0 6px ${tracking.isDetected ? '#00ff88' : '#ff4444'}`,
            }}
          />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>LIVE</span>
        </div>
      </div>

      {/* Video wrapper */}
      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            display: 'block',
            transform: 'scaleX(-1)',
            objectFit: 'cover',
          }}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={overlayCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Gesture label bar */}
      <div
        style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '6px 12px',
          textAlign: 'center',
          fontSize: 11,
          letterSpacing: 1.5,
          color: GESTURE_COLORS[gesture.current] || 'rgba(255,255,255,0.4)',
        }}
      >
        {gesture.current}
      </div>
    </div>
  );
}
