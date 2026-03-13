import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import type { HandTrackingState, Landmark, FingertipState } from '../types/handTracking';
import { FINGERTIP_INDICES } from '../constants/config';

const DEFAULT_STATE: HandTrackingState = {
  isDetected: false,
  handedness: null,
  fingertips: { thumb: null, index: null, middle: null, ring: null, pinky: null },
  rawLandmarks: [],
  confidence: 0,
  timestamp: 0,
};

/**
 * React hook to track the user's right hand using MediaPipe Hands and return fingertip landmarks.
 */
export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement>
): HandTrackingState {
  const [state, setState] = useState<HandTrackingState>(DEFAULT_STATE);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const onResults = useCallback((results: Results) => {
    // No hands detected
    if (!results.multiHandLandmarks || !results.multiHandedness) {
      setState(DEFAULT_STATE);
      return;
    }
    // Find the user's right hand (labeled 'Left' due to selfieMode)
    let found = false;
    for (let i = 0; i < results.multiHandedness.length; i++) {
      const handedness = results.multiHandedness[i];
      if (handedness.label === 'Left') {
        const landmarks = results.multiHandLandmarks[i] as Landmark[];
        if (!landmarks || landmarks.length !== 21) continue;
        // Extract fingertips
        const fingertips: FingertipState = {
          thumb: landmarks[FINGERTIP_INDICES.thumb] ?? null,
          index: landmarks[FINGERTIP_INDICES.index] ?? null,
          middle: landmarks[FINGERTIP_INDICES.middle] ?? null,
          ring: landmarks[FINGERTIP_INDICES.ring] ?? null,
          pinky: landmarks[FINGERTIP_INDICES.pinky] ?? null,
        };
        setState({
          isDetected: true,
          handedness: 'Right',
          fingertips,
          rawLandmarks: landmarks,
          confidence: handedness.score ?? 1,
          timestamp: typeof performance !== 'undefined' ? performance.now() : Date.now(),
        });
        found = true;
        break;
      }
    }
    if (!found) {
      setState(DEFAULT_STATE);
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      modelComplexity: 1,
      maxNumHands: 1,
      minDetectionConfidence: 0.75,
      minTrackingConfidence: 0.75,
      selfieMode: true,
    });
    hands.onResults(onResults);
    handsRef.current = hands;

    let camera: Camera | null = null;
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

  return state;
}
