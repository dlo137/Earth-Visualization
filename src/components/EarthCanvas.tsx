import { useRef } from 'react';
import { useParticleSystem } from '../hooks/useParticleSystem';
import type { InteractionFrame } from '../types/interactionBridge';

interface EarthCanvasProps {
  interactionFrame?: InteractionFrame;
}

export default function EarthCanvas({ interactionFrame }: EarthCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticleSystem(canvasRef, interactionFrame);
  // TODO: implement
  return <canvas ref={canvasRef} />;
}
