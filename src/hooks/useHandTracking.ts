import { useEffect, useRef, useState, useCallback } from 'react';
import '@mediapipe/hands';
declare const Hands: any;
type Results = any;
import '@mediapipe/camera_utils';
declare const Camera: any;
import type { HandTrackingState, Landmark, FingertipState } from '../types/handTracking';
import { FINGERTIP_INDICES } from '../constants/config';

export const DEFAULT_HAND_STATE: HandTrackingState = {
  isDetected: false,
  handedness: null,
  fingertips: { thumb: null, index: null, middle: null, ring: null, pinky: null },
  rawLandmarks: [],
  confidence: 0,
  timestamp: 0,
};

/**
 * React hook to track up to 2 hands using MediaPipe Hands and return fingertip landmarks.
 */
export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement>
): HandTrackingState[] {
  const [hands, setHands] = useState<HandTrackingState[]>([]);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const onResults = useCallback((results: Results) => {
    if (!results.multiHandLandmarks || !results.multiHandedness || results.multiHandedness.length === 0) {
      setHands([]);
      return;
    }
    const detected: HandTrackingState[] = [];
    for (let i = 0; i < results.multiHandedness.length; i++) {
      const handedness = results.multiHandedness[i];
      const landmarks = results.multiHandLandmarks[i] as Landmark[];
      if (!landmarks || landmarks.length !== 21) continue;
      // In selfieMode, MediaPipe flips labels: 'Left' = user's right, 'Right' = user's left
      const resolvedHandedness: 'Left' | 'Right' = handedness.label === 'Left' ? 'Right' : 'Left';
      const fingertips: FingertipState = {
        thumb: landmarks[FINGERTIP_INDICES.thumb] ?? null,
        index: landmarks[FINGERTIP_INDICES.index] ?? null,
        middle: landmarks[FINGERTIP_INDICES.middle] ?? null,
        ring: landmarks[FINGERTIP_INDICES.ring] ?? null,
        pinky: landmarks[FINGERTIP_INDICES.pinky] ?? null,
      };
      detected.push({
        isDetected: true,
        handedness: resolvedHandedness,
        fingertips,
        rawLandmarks: landmarks,
        confidence: handedness.score ?? 1,
        timestamp: typeof performance !== 'undefined' ? performance.now() : Date.now(),
      });
    }
    setHands(detected);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      modelComplexity: 1,
      maxNumHands: 2,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true,
    });
    hands.onResults(onResults);
    handsRef.current = hands;

    let camera: any = null;
    if (videoRef.current) {
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      cameraRef.current = camera;
      camera.start();
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef]);

  return hands;
}
