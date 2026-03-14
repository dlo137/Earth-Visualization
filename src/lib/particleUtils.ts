import type { Particle } from '../types/particles';
import type { ParticleSystemConfig } from '../types/particles';
import { sphericalToCartesian, lerpV3, clamp } from './mathUtils';

/** Returns true if the lat/lon falls over a land mass (approximate continent outlines). */
function isLand(lat: number, lon: number): boolean {
  // Antarctica
  if (lat < -65) return true;
  // Greenland
  if (lat > 60 && lat < 85 && lon > -75 && lon < -12) return true;
  // Iceland
  if (lat > 63 && lat < 67 && lon > -25 && lon < -13) return true;
  // North America (mainland + Central America)
  if (lat > 7 && lat < 72 && lon > -168 && lon < -52) {
    if (lat < 25 && lon > -78 && lon < -60) return false; // Caribbean Sea
    return true;
  }
  // South America
  if (lat > -56 && lat < 13 && lon > -82 && lon < -34) return true;
  // UK / Ireland
  if (lat > 49 && lat < 61 && lon > -11 && lon < 2) return true;
  // Europe
  if (lat > 36 && lat < 72 && lon > -9 && lon < 40) return true;
  // Africa
  if (lat > -35 && lat < 38 && lon > -18 && lon < 52) return true;
  // Arabian Peninsula
  if (lat > 12 && lat < 32 && lon > 35 && lon < 60) return true;
  // Asia main body
  if (lat > 1 && lat < 78 && lon > 26 && lon < 150) {
    if (lat < 10 && lon > 100 && lon < 120) return false; // South China Sea
    return true;
  }
  // SE Asia / Indonesia
  if (lat > -10 && lat < 20 && lon > 95 && lon < 142) return true;
  // Australia
  if (lat > -44 && lat < -10 && lon > 114 && lon < 154) return true;
  // New Zealand
  if (lat > -47 && lat < -34 && lon > 166 && lon < 178) return true;
  // Japan
  if (lat > 31 && lat < 46 && lon > 129 && lon < 146) return true;
  return false;
}

/** Returns true if the lat/lon falls in a major desert region. */
function isDesert(lat: number, lon: number): boolean {
  if (lat > 15 && lat < 35 && lon > -18 && lon < 40) return true;  // Sahara
  if (lat > 15 && lat < 32 && lon > 36 && lon < 60) return true;   // Arabian
  if (lat > 38 && lat < 50 && lon > 90 && lon < 120) return true;  // Gobi
  if (lat > 25 && lat < 36 && lon > -120 && lon < -100) return true; // Mojave/Sonoran
  if (lat > -35 && lat < -20 && lon > 118 && lon < 145) return true; // Australian outback
  if (lat > -30 && lat < -15 && lon > -72 && lon < -65) return true; // Atacama
  return false;
}

/**
 * Returns a realistic Earth color based on geographic position and biome.
 */
function generateEarthColor(phi: number, theta: number): { r: number; g: number; b: number } {
  const lat = 90 - (phi * 180) / Math.PI;
  const lon = (theta * 180) / Math.PI - 180;
  const absLat = Math.abs(lat);
  const n = Math.random() * 0.06 - 0.03; // subtle per-particle noise

  // Polar ice caps
  if (lat > 68 || lat < -65) {
    const i = absLat > 76 ? 0.97 : 0.82;
    return { r: clamp(i + n, 0, 1), g: clamp(i + n * 0.5, 0, 1), b: clamp(i + 0.04 + n, 0, 1) };
  }

  if (!isLand(lat, lon)) {
    // Ocean — vary by latitude for temperature
    if (absLat > 55) {
      return { r: clamp(0.04 + n, 0, 1), g: clamp(0.18 + n, 0, 1), b: clamp(0.48 + n, 0, 1) };
    }
    if (Math.random() > 0.75) {
      // Shallow / coastal tint
      return { r: clamp(0.07 + n, 0, 1), g: clamp(0.33 + n, 0, 1), b: clamp(0.72 + n, 0, 1) };
    }
    // Deep ocean
    return { r: clamp(0.02 + n, 0, 1), g: clamp(0.1 + n, 0, 1), b: clamp(0.42 + n, 0, 1) };
  }

  // Desert biome
  if (isDesert(lat, lon)) {
    return { r: clamp(0.76 + n * 2, 0, 1), g: clamp(0.6 + n * 2, 0, 1), b: clamp(0.27 + n, 0, 1) };
  }

  // Tundra
  if (absLat > 58) {
    return { r: clamp(0.52 + n, 0, 1), g: clamp(0.56 + n, 0, 1), b: clamp(0.42 + n, 0, 1) };
  }

  // Tropical forest
  if (absLat < 23) {
    return { r: clamp(0.06 + n, 0, 1), g: clamp(0.42 + n, 0, 1), b: clamp(0.1 + n, 0, 1) };
  }

  // Temperate
  return { r: clamp(0.16 + n, 0, 1), g: clamp(0.48 + n, 0, 1), b: clamp(0.16 + n, 0, 1) };
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
    const color = generateEarthColor(phi, theta);
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
