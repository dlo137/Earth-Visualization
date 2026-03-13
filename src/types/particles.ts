export interface Particle {
  id: number;
  position: { x: number; y: number; z: number };
  originPosition: { x: number; y: number; z: number };
  targetPosition: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  color: { r: number; g: number; b: number };
  size: number;
  opacity: number;
  isDispersed: boolean;
  disperseOffset: { x: number; y: number; z: number };
}

export interface ParticleSystemConfig {
  count: number;
  radius: number;
  disperseRadius: number;
  returnSpeed: number;
  disperseSpeed: number;
  rotationSensitivity: number;
}

export type ParticleSystemState = 'FORMED' | 'DISPERSING' | 'DISPERSED' | 'TIGHTENING';
