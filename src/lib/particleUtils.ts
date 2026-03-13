import type { Particle } from '../types/particles';
import type { ParticleSystemConfig } from '../types/particles';
import { sphericalToCartesian, lerpV3, clamp } from './mathUtils';

/**
 * Returns a color { r, g, b } based on phi angle, with random jitter.
 */
function generateEarthColor(phi: number): { r: number; g: number; b: number } {
  let base: { r: number; g: number; b: number };
  if (phi < 0.3) base = { r: 0.9, g: 0.95, b: 1.0 };
  else if (phi < 1.0) base = { r: 0.1, g: 0.4, b: 0.8 };
  else if (phi < 1.6) base = { r: 0.2, g: 0.6, b: 0.2 };
  else if (phi < 2.2) base = { r: 0.05, g: 0.3, b: 0.7 };
  else if (phi < 2.8) base = { r: 0.85, g: 0.9, b: 1.0 };
  else base = { r: 0.0, g: 0.2, b: 0.5 };
  return {
    r: clamp(base.r + (Math.random() * 0.1 - 0.05), 0, 1),
    g: clamp(base.g + (Math.random() * 0.1 - 0.05), 0, 1),
    b: clamp(base.b + (Math.random() * 0.1 - 0.05), 0, 1),
  };
}

/**
 * Generates a random 3D unit vector scaled to disperseRadius.
 */
function generateDisperseOffset(disperseRadius: number): { x: number; y: number; z: number } {
  let x = Math.random() * 2 - 1;
  let y = Math.random() * 2 - 1;
  let z = Math.random() * 2 - 1;
  const len = Math.sqrt(x * x + y * y + z * z) || 1;
  x = (x / len) * disperseRadius;
  y = (y / len) * disperseRadius;
  z = (z / len) * disperseRadius;
  return { x, y, z };
}

/**
 * Generates an array of Particle objects placed on the surface of a sphere using Fibonacci sphere distribution.
 */
export function generateEarthSurface(config: ParticleSystemConfig): Particle[] {
  const particles: Particle[] = [];
  const count = config.count;
  const radius = config.radius;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = (2 * Math.PI * i) / goldenRatio;
    const cartesian = sphericalToCartesian(radius, phi, theta);
    const color = generateEarthColor(phi);
    const disperseOffset = generateDisperseOffset(config.disperseRadius);
    const particle: Particle = {
      id: i,
      position: { ...cartesian },
      originPosition: { ...cartesian },
      targetPosition: { ...cartesian },
      velocity: { x: 0, y: 0, z: 0 },
      color,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.6,
      isDispersed: false,
      disperseOffset,
    };
    particles.push(particle);
  }
  return particles;
}

/**
 * Lerps each particle's position toward its targetPosition using the appropriate speed from config.
 */
export function updateParticlePositions(
  particles: Particle[],
  config: ParticleSystemConfig
): void {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const t = p.isDispersed ? config.disperseSpeed : config.returnSpeed;
    p.position.x += (p.targetPosition.x - p.position.x) * t;
    p.position.y += (p.targetPosition.y - p.position.y) * t;
    p.position.z += (p.targetPosition.z - p.position.z) * t;
  }
}

/**
 * Sets each particle's targetPosition to originPosition + disperseOffset, and sets isDispersed to true.
 */
export function disperseParticles(particles: Particle[]): void {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.targetPosition.x = p.originPosition.x + p.disperseOffset.x;
    p.targetPosition.y = p.originPosition.y + p.disperseOffset.y;
    p.targetPosition.z = p.originPosition.z + p.disperseOffset.z;
    p.isDispersed = true;
  }
}

/**
 * Sets each particle's targetPosition back to its originPosition, and sets isDispersed to false.
 */
export function tightenParticles(particles: Particle[]): void {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.targetPosition.x = p.originPosition.x;
    p.targetPosition.y = p.originPosition.y;
    p.targetPosition.z = p.originPosition.z;
    p.isDispersed = false;
  }
}

/**
 * Writes all particle positions into a flat Float32Array in [x,y,z,...] format.
 */
export function getPositionBuffer(
  particles: Particle[],
  buffer: Float32Array
): void {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i].position;
    const idx = i * 3;
    buffer[idx] = p.x;
    buffer[idx + 1] = p.y;
    buffer[idx + 2] = p.z;
  }
}

/**
 * Writes all particle colors into a flat Float32Array in [r,g,b,...] format.
 */
export function getColorBuffer(
  particles: Particle[],
  buffer: Float32Array
): void {
  for (let i = 0; i < particles.length; i++) {
    const c = particles[i].color;
    const idx = i * 3;
    buffer[idx] = c.r;
    buffer[idx + 1] = c.g;
    buffer[idx + 2] = c.b;
  }
}
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
