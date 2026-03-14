import type { GestureConfig } from '../types/gestures';
import type { ParticleSystemConfig } from '../types/particles';
import type { InteractionConfig } from '../types/interactionBridge';

export const FINGERTIP_INDICES = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
} as const;

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  disperseSpreadThreshold: 0.15,
  tightenFistThreshold: 0.09,
  pinchDistanceThreshold: 0.07,
  rotateExtensionThreshold: 0.10,
  gestureDebounceMs: 150,
};

export const DEFAULT_PARTICLE_CONFIG: ParticleSystemConfig = {
  count: 40000,
  radius: 2.0,
  disperseRadius: 5.0,
  returnSpeed: 0.12,
  disperseSpeed: 0.05,
  rotationSensitivity: 4.0,
  particleSize: 0.011,
};

export const DEFAULT_INTERACTION_CONFIG: InteractionConfig = {
  smoothingFactor: 0.2,
  gestureDebounceMs: 150,
  mirrorX: true,
};
