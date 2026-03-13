import { useAppState } from '../context/AppStateContext';

const GESTURE_COLORS: Record<string, string> = {
  IDLE: 'rgba(255,255,255,0.4)',
  ROTATE: '#60a5fa',
  DISPERSE: '#f97316',
  TIGHTEN: '#a78bfa',
  PINCH: '#34d399',
};

export default function DebugOverlay() {
  const { fps, gesture, tracking, showDebugOverlay } = useAppState();

  if (!showDebugOverlay) return null;

  const color = GESTURE_COLORS[gesture.current] ?? 'rgba(255,255,255,0.4)';

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 1000,
        fontFamily: 'monospace',
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 8,
        padding: '10px 14px',
        lineHeight: 1.8,
        minWidth: 200,
        pointerEvents: 'none',
      }}
    >
      <div style={{ color: '#60a5fa', marginBottom: 4, letterSpacing: 1 }}>DEBUG</div>
      <div>FPS: <span style={{ color: '#34d399' }}>{fps}</span></div>
      <div>
        GESTURE:{' '}
        <span style={{ color }}>{gesture.current}</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
          {' '}({Math.round(gesture.confidence * 100)}%)
        </span>
      </div>
      <div>HAND: <span style={{ color: tracking.isDetected ? '#34d399' : '#ff4444' }}>
        {tracking.isDetected ? `${tracking.handedness ?? 'Unknown'} (${Math.round(tracking.confidence * 100)}%)` : 'none'}
      </span></div>
      {tracking.isDetected && tracking.fingertips.index && (
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
          IDX x:{tracking.fingertips.index.x.toFixed(3)}{' '}
          y:{tracking.fingertips.index.y.toFixed(3)}{' '}
          z:{tracking.fingertips.index.z.toFixed(3)}
        </div>
      )}
    </div>
  );
}
