import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
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
 * React hook to track hands using MediaPipe Tasks Vision (HandLandmarker).
 * Replaces the deprecated @mediapipe/hands which is incompatible with modern Chrome.
 */
export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement>
): HandTrackingState {
  const [state, setState] = useState<HandTrackingState>(DEFAULT_STATE);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const results = landmarker.detectForVideo(video, performance.now());

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0] as Landmark[];
        const topCategory = results.handedness[0]?.[0];

        const fingertips: FingertipState = {
          thumb: landmarks[FINGERTIP_INDICES.thumb] ?? null,
          index: landmarks[FINGERTIP_INDICES.index] ?? null,
          middle: landmarks[FINGERTIP_INDICES.middle] ?? null,
          ring: landmarks[FINGERTIP_INDICES.ring] ?? null,
          pinky: landmarks[FINGERTIP_INDICES.pinky] ?? null,
        };
        setState({
          isDetected: true,
          handedness: (topCategory?.categoryName as 'Left' | 'Right') ?? null,
          fingertips,
          rawLandmarks: landmarks,
          confidence: topCategory?.score ?? 1,
          timestamp: performance.now(),
        });
      } else {
        setState(DEFAULT_STATE);
      }
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, [videoRef]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const vision = await FilesetResolver.forVisionTasks('/mediapipe-wasm');
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      if (cancelled) {
        landmarker.close();
        return;
      }

      landmarkerRef.current = landmarker;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        rafRef.current = requestAnimationFrame(processFrame);
      }
    }

    init().catch(console.error);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
      setState(DEFAULT_STATE);
    };
  }, [videoRef, processFrame]);

  return state;
}
