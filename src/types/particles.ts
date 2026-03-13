import type { Vector3 } from 'three';

export interface Particle {
  id: number;
  position: Vector3;
  originPosition: Vector3;
  targetPosition: Vector3;
  velocity: Vector3;
  color: number;
  size: number;
  opacity: number;
  isDispersed: boolean;
  disperseOffset: Vector3;
}

export interface ParticleSystemConfig {
  count: number;
  earthRadius: number;
  disperseRadius: number;
  returnSpeed: number;
  disperseSpeed: number;
  rotationSensitivity: number;
}

export type ParticleSystemState = 'FORMED' | 'DISPERSING' | 'DISPERSED' | 'TIGHTENING';
