import {
  createContext,
  useContext,
  useRef,
  useState,
  useMemo,
  type ReactNode
} from 'react';
import type { HandTrackingState } from '../types/handTracking';
import type { GestureState } from '../types/gestures';
import type { ParticleSystemState } from '../types/particles';
import type { InteractionFrame, InteractionConfig } from '../types/interactionBridge';
import { useHandTracking } from '../hooks/useHandTracking';
import { useGesture } from '../hooks/useGesture';
import { useParticleSystem } from '../hooks/useParticleSystem';
import { DEFAULT_INTERACTION_CONFIG, DEFAULT_PARTICLE_CONFIG } from '../constants/config';
import { normalizeToNDC, exponentialMovingAverage, fingertipDelta } from '../lib/mathUtils';

export interface AppContextValue {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  tracking: HandTrackingState;
  gesture: GestureState;
  particleState: ParticleSystemState;
  fps: number;
  interaction: InteractionFrame;
  showTrackingWindow: boolean;
  showDebugOverlay: boolean;
  toggleTrackingWindow: () => void;
  toggleDebugOverlay: () => void;
}

const AppStateContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hooks
  const tracking = useHandTracking(videoRef);
  const gesture = useGesture(tracking, DEFAULT_INTERACTION_CONFIG.gestureConfig);

  // Interaction frame refs
  const prevIndexRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const smoothedPointerRef = useRef<{ x: number; y: number } | null>(null);
  const rotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const disperseProgressRef = useRef<number>(0);

  // Build interaction frame
  const interaction: InteractionFrame = useMemo(() => {
    const config = DEFAULT_INTERACTION_CONFIG;
    let pointer: InteractionFrame['pointer'] = null;
    const indexTip = tracking.isDetected ? tracking.fingertips.index : null;
    if (tracking.isDetected && indexTip) {
      const raw = normalizeToNDC(indexTip.x, indexTip.y, config.mirrorX);
      if (!smoothedPointerRef.current) {
        smoothedPointerRef.current = { x: raw.x, y: raw.y };
      } else {
        smoothedPointerRef.current.x = exponentialMovingAverage(
          smoothedPointerRef.current.x,
          raw.x,
          config.smoothingFactor
        );
        smoothedPointerRef.current.y = exponentialMovingAverage(
          smoothedPointerRef.current.y,
          raw.y,
          config.smoothingFactor
        );
      }
      let delta = { dx: 0, dy: 0 };
      if (prevIndexRef.current) {
        delta = fingertipDelta(indexTip, prevIndexRef.current, config.mirrorX);
      }
      prevIndexRef.current = { ...indexTip };
      pointer = {
        x: smoothedPointerRef.current.x,
        y: smoothedPointerRef.current.y,
        deltaX: delta.dx,
        deltaY: delta.dy,
      };
    } else {
      pointer = null;
      prevIndexRef.current = null;
      smoothedPointerRef.current = null;
    }

    // Rotation
    if (gesture.current === 'ROTATE' && pointer) {
      rotationRef.current.x += pointer.deltaY * 0.01;
      rotationRef.current.y += pointer.deltaX * 0.01;
    }

    // Disperse progress
    if (gesture.current === 'DISPERSE') {
      disperseProgressRef.current = Math.min(disperseProgressRef.current + 0.05, 1);
    } else if (gesture.current === 'TIGHTEN') {
      disperseProgressRef.current = Math.max(disperseProgressRef.current - 0.05, 0);
    }

    return {
      pointer,
      gesture: gesture.current,
      gestureStrength: gesture.confidence,
      rotationX: rotationRef.current.x,
      rotationY: rotationRef.current.y,
      disperseProgress: disperseProgressRef.current,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking, gesture]);

  // Particle system
  const { particleState, fps } = useParticleSystem(canvasRef, interaction, DEFAULT_PARTICLE_CONFIG);

  // UI toggles
  const [showTrackingWindow, setShowTrackingWindow] = useState<boolean>(true);
  const [showDebugOverlay, setShowDebugOverlay] = useState<boolean>(true);
  const toggleTrackingWindow = () => setShowTrackingWindow((v) => !v);
  const toggleDebugOverlay = () => setShowDebugOverlay((v) => !v);

  // Memoize context value
  const value = useMemo<AppContextValue>(() => ({
    videoRef,
    canvasRef,
    tracking,
    gesture,
    particleState,
    fps,
    interaction,
    showTrackingWindow,
    showDebugOverlay,
    toggleTrackingWindow,
    toggleDebugOverlay,
  }), [tracking, gesture, particleState, fps, interaction, showTrackingWindow, showDebugOverlay]);

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
import { createContext, useContext, useState } from 'react';
import type { HandTrackingState } from '../types/handTracking';
import type { GestureState } from '../types/gestures';
import type { ParticleSystemState } from '../types/particles';
import type { InteractionFrame } from '../types/interactionBridge';

interface AppState {
  tracking: HandTrackingState;
  gesture: GestureState;
  particleState: ParticleSystemState;
  interactionFrame: InteractionFrame | null;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // TODO: implement
  return (
    <AppStateContext.Provider value={null}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  // TODO: implement
  return ctx;
}
