import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { ParticleSystemConfig, ParticleSystemState } from '../types/particles';
import type { InteractionFrame } from '../types/interactionBridge';
import {
  generateEarthSurface,
  updateParticlePositions,
  disperseParticles,
  tightenParticles,
  getPositionBuffer,
  getColorBuffer
} from '../lib/particleUtils';
import { DEFAULT_PARTICLE_CONFIG } from '../constants/config';

type UseParticleSystemReturn = {
  particleState: ParticleSystemState;
  fps: number;
};

/**
 * React hook to set up and animate the Three.js particle Earth system.
 */
export function useParticleSystem(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  interaction: InteractionFrame,
  config: ParticleSystemConfig = DEFAULT_PARTICLE_CONFIG
): UseParticleSystemReturn {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<ReturnType<typeof generateEarthSurface> | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const positionBufferRef = useRef<Float32Array | null>(null);
  const colorBufferRef = useRef<Float32Array | null>(null);
  const animFrameRef = useRef<number>(0);
  const particleStateRef = useRef<ParticleSystemState>('FORMED');
  const fpsRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const interactionRef = useRef<InteractionFrame>(interaction);

  // Keep interactionRef up to date
  useEffect(() => {
    interactionRef.current = interaction;
  }, [interaction]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x404040));
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Particles
    const particles = generateEarthSurface(config);
    particlesRef.current = particles;
    const positionBuffer = new Float32Array(config.count * 3);
    const colorBuffer = new Float32Array(config.count * 3);
    getPositionBuffer(particles, positionBuffer);
    getColorBuffer(particles, colorBuffer);
    positionBufferRef.current = positionBuffer;
    colorBufferRef.current = colorBuffer;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positionBuffer, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorBuffer, 3));

    const material = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // Window resize handler
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = (timestamp: number) => {
      // FPS calculation
      const delta = timestamp - lastTimeRef.current;
      fpsRef.current = delta > 0 ? Math.round(1000 / delta) : fpsRef.current;
      lastTimeRef.current = timestamp;

      // Read interaction from ref
      const currentInteraction = interactionRef.current;
      const gesture = currentInteraction.gesture;
      const pointer = currentInteraction.pointer;
      const particles = particlesRef.current;
      const points = pointsRef.current;
      if (particles && points) {
        // Disperse
        if (gesture === 'DISPERSE' && particleStateRef.current !== 'DISPERSED') {
          disperseParticles(particles);
          particleStateRef.current = 'DISPERSING';
        }
        // Tighten
        if (gesture === 'TIGHTEN' && particleStateRef.current !== 'FORMED') {
          tightenParticles(particles);
          particleStateRef.current = 'TIGHTENING';
        }
        // Rotate
        if (gesture === 'ROTATE' && pointer) {
          points.rotation.y += pointer.deltaX * config.rotationSensitivity * 0.01;
          points.rotation.x += pointer.deltaY * config.rotationSensitivity * 0.01;
        }
        // Update positions
        updateParticlePositions(particles, config);
        if (positionBufferRef.current) {
          getPositionBuffer(particles, positionBufferRef.current);
          const attr = points.geometry.getAttribute('position');
          if (attr) {
            attr.needsUpdate = true;
          }
        }
        // Auto-rotate when idle
        if (gesture === 'IDLE') {
          points.rotation.y += 0.001;
        }
      }
      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, config]);

  return {
    get particleState() {
      return particleStateRef.current;
    },
    get fps() {
      return fpsRef.current;
    },
  };
}
