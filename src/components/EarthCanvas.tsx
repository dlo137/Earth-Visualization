import { useAppState } from '../context/AppStateContext';

export default function EarthCanvas() {
  const { canvasRef } = useAppState();
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'block',
        zIndex: 0,
        background: '#000000',
      }}
    />
  );
}
