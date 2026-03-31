import { create } from 'zustand';
import type { DFA } from '../types/dfa';
import { minimizeDFA } from '../algorithm/minimize';
import type { StepSummary } from '../algorithm/minimize';

interface DFAStoreState {
  dfa: DFA | null;
  steps: StepSummary[];
  currentStepIndex: number;
  isPlaying: boolean;
  setDFA: (dfa: DFA) => void;
  resetDFA: () => void;
  setStep: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const useDFAStore = create<DFAStoreState>((set) => ({
  dfa: null,
  steps: [],
  currentStepIndex: 0,
  isPlaying: false,
  setDFA: (dfa) => {
    const steps = minimizeDFA(dfa);
    set({ dfa, steps, currentStepIndex: 0, isPlaying: false });
  },
  resetDFA: () => set({ dfa: null, steps: [], currentStepIndex: 0, isPlaying: false }),
  setStep: (index) => set({ currentStepIndex: index }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
