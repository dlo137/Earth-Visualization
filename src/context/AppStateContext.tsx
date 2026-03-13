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
