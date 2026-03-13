import * as THREE from 'three';
import type { Particle, ParticleSystemConfig } from '../types/particles';

export function generateEarthSurface(config: ParticleSystemConfig): Particle[] {
  void config;
  // TODO: implement
  return [];
}

export function disperseParticles(particles: Particle[], config: ParticleSystemConfig): void {
  void particles;
  void config;
  // TODO: implement
}

export function tightenParticles(particles: Particle[], config: ParticleSystemConfig): void {
  void particles;
  void config;
  // TODO: implement
}

export function updateParticlePositions(
  particles: Particle[],
  geometry: THREE.BufferGeometry
): void {
  void particles;
  void geometry;
  // TODO: implement
}
