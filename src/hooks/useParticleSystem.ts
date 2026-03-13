import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { InteractionFrame } from '../types/interactionBridge';
import type { ParticleSystemState } from '../types/particles';
import { generateEarthSurface } from '../lib/particleUtils';
import { DEFAULT_PARTICLE_CONFIG } from '../constants/config';

export function useParticleSystem(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  interactionFrame?: InteractionFrame
): ParticleSystemState {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  void rendererRef;
  void generateEarthSurface;
  void DEFAULT_PARTICLE_CONFIG;
  void interactionFrame;
  // TODO: implement
  return 'FORMED';
}
