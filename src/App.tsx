import { useEffect } from 'react';
import { useAppState } from './context/AppStateContext';
import { AppStateProvider } from './context/AppStateContext';
import EarthCanvas from './components/EarthCanvas';
import TrackingWindow from './components/TrackingWindow';
import DebugOverlay from './components/DebugOverlay';

function AppInner() {
  const {
    showTrackingWindow,
    showDebugOverlay,
    toggleTrackingWindow,
    toggleDebugOverlay,
  } = useAppState();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') toggleTrackingWindow();
      if (e.key === 'd' || e.key === 'D') toggleDebugOverlay();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleTrackingWindow, toggleDebugOverlay]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        overflow: 'hidden',
      }}
    >
      <EarthCanvas />
      {showTrackingWindow && <TrackingWindow />}
      {showDebugOverlay && <DebugOverlay />}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 999,
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          onClick={toggleTrackingWindow}
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 20,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 10,
            padding: '4px 10px',
            cursor: 'pointer',
            letterSpacing: 1,
            fontFamily: 'monospace',
          }}
        >
          {showTrackingWindow ? 'HIDE CAM [T]' : 'SHOW CAM [T]'}
        </button>
        <button
          onClick={toggleDebugOverlay}
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 20,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 10,
            padding: '4px 10px',
            cursor: 'pointer',
            letterSpacing: 1,
            fontFamily: 'monospace',
          }}
        >
          {showDebugOverlay ? 'HIDE DEBUG [D]' : 'SHOW DEBUG [D]'}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppInner />
    </AppStateProvider>
  );
}
