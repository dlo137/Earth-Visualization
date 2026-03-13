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
  tightenFistThreshold: 0.05,
  pinchDistanceThreshold: 0.04,
  rotateExtensionThreshold: 0.10,
};

export const DEFAULT_PARTICLE_CONFIG: ParticleSystemConfig = {
  count: 8000,
  earthRadius: 2.0,
  disperseRadius: 5.0,
  returnSpeed: 0.03,
  disperseSpeed: 0.05,
  rotationSensitivity: 2.5,
};

export const DEFAULT_INTERACTION_CONFIG: InteractionConfig = {
  smoothingFactor: 0.2,
  gestureDebounceMs: 150,
  mirrorX: true,
};
