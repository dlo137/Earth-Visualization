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
import type { InteractionFrame } from '../types/interactionBridge';
import { useHandTracking, DEFAULT_HAND_STATE } from '../hooks/useHandTracking';
import { useGesture } from '../hooks/useGesture';
import { useParticleSystem } from '../hooks/useParticleSystem';
import { DEFAULT_INTERACTION_CONFIG, DEFAULT_PARTICLE_CONFIG, DEFAULT_GESTURE_CONFIG } from '../constants/config';
import { normalizeToNDC, exponentialMovingAverage, fingertipDelta, landmarkDistance, clamp } from '../lib/mathUtils';
import { detectGesture } from '../lib/gestureClassifier';

export interface AppContextValue {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  tracking: HandTrackingState;
  hands: HandTrackingState[];
  bothHandsDetected: boolean;
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
  const hands = useHandTracking(videoRef as React.RefObject<HTMLVideoElement>);
  const tracking = hands[0] ?? DEFAULT_HAND_STATE;
  const bothHandsDetected = hands.length >= 2;
  const gesture = useGesture(tracking);

  // Interaction frame refs
  const prevIndexRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const smoothedPointerRef = useRef<{ x: number; y: number } | null>(null);
  const rotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const disperseProgressRef = useRef<number>(0);
  const isZoomModeRef = useRef<boolean>(false);
  const zoomScaleRef = useRef<number>(1.0);
  const isSelectedRef = useRef<boolean>(false);

  // Build interaction frame
  const interaction: InteractionFrame = useMemo(() => {
    const config = DEFAULT_INTERACTION_CONFIG;
    let pointer: InteractionFrame['pointer'] = { x: 0, y: 0, deltaX: 0, deltaY: 0 };
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
      prevIndexRef.current = null;
      smoothedPointerRef.current = null;
      pointer = { x: 0, y: 0, deltaX: 0, deltaY: 0 };
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

    // Zoom mode state machine
    const rightHand = hands.find(h => h.handedness === 'Right') ?? null;
    const leftHand = hands.find(h => h.handedness === 'Left') ?? null;
    const leftGesture = leftHand ? detectGesture(leftHand.fingertips, DEFAULT_GESTURE_CONFIG) : 'IDLE';

    // Enter: right hand shows PINCH (clears any prior selected state)
    if (gesture.current === 'PINCH' && !isZoomModeRef.current) {
      isZoomModeRef.current = true;
      isSelectedRef.current = false;
    }
    // Exit (lock in scale): left hand fist while right hand is in zoom mode → SELECTED
    if (isZoomModeRef.current && leftHand && leftGesture === 'TIGHTEN') {
      isZoomModeRef.current = false;
      isSelectedRef.current = true;
      // zoomScaleRef keeps its current value — scale is locked in
    }
    // Exit (reset): right hand lost entirely
    if (isZoomModeRef.current && !rightHand && !tracking.isDetected) {
      isZoomModeRef.current = false;
      isSelectedRef.current = false;
      zoomScaleRef.current = 1.0;
    }
    // While in zoom mode, map right-hand thumb-index distance to scale
    if (isZoomModeRef.current) {
      const src = rightHand ?? tracking;
      const thumbTip = src.fingertips.thumb;
      const idxTip = src.fingertips.index;
      if (thumbTip && idxTip) {
        const dist = landmarkDistance(thumbTip, idxTip);
        const pinchThreshold = DEFAULT_GESTURE_CONFIG.pinchDistanceThreshold;
        zoomScaleRef.current = clamp(pinchThreshold / Math.max(dist, pinchThreshold), 0.2, 1.0);
      }
    }

    return {
      pointer,
      gesture: gesture.current,
      previousGesture: gesture.previous,
      gestureStrength: gesture.confidence,
      rotationX: rotationRef.current.x,
      rotationY: rotationRef.current.y,
      disperseProgress: disperseProgressRef.current,
      handsDetected: hands.length > 0,
      isZoomMode: isZoomModeRef.current,
      zoomScale: zoomScaleRef.current,
      isSelected: isSelectedRef.current,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking, gesture]);

  // Particle system
  const { particleState, fps } = useParticleSystem(canvasRef as React.RefObject<HTMLCanvasElement>, interaction, DEFAULT_PARTICLE_CONFIG);

  // UI toggles
  const [showTrackingWindow, setShowTrackingWindow] = useState<boolean>(true);
  const [showDebugOverlay, setShowDebugOverlay] = useState<boolean>(true);
  const toggleTrackingWindow = () => setShowTrackingWindow((v) => !v);
  const toggleDebugOverlay = () => setShowDebugOverlay((v) => !v);

  // Memoize context value
  const value = useMemo<AppContextValue>(() => ({
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    tracking,
    hands,
    bothHandsDetected,
    gesture,
    particleState,
    fps,
    interaction,
    showTrackingWindow,
    showDebugOverlay,
    toggleTrackingWindow,
    toggleDebugOverlay,
  }), [tracking, hands, bothHandsDetected, gesture, particleState, fps, interaction, showTrackingWindow, showDebugOverlay]);

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
