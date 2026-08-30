import { create } from 'zustand';

export type LensAction = 
  | 'ask' | 'explain' | 'analyze' | 'verify' 
  | 'compare' | 'find_evidence' | 'summarize' 
  | 'translate' | 'create_notes';

export interface LensSelection {
  text: string;
  page: number;
  documentId: string;
  rect: { top: number; left: number; width: number; height: number };
}

interface LensState {
  selection: LensSelection | null;
  isToolbarVisible: boolean;
  activeLensAction: LensAction | null;
  isLensStreaming: boolean;
  isLensDirectOpen: boolean;

  setSelection: (sel: LensSelection | null) => void;
  showToolbar: () => void;
  hideToolbar: () => void;
  setActiveLensAction: (action: LensAction | null) => void;
  setLensStreaming: (streaming: boolean) => void;
  openLensDirect: () => void;
  closeLensDirect: () => void;
  toggleLensDirect: () => void;
  clearLens: () => void;
}

export const useLensStore = create<LensState>()((set) => ({
  selection: null,
  isToolbarVisible: false,
  activeLensAction: null,
  isLensStreaming: false,
  isLensDirectOpen: false,

  setSelection: (sel) => set({ selection: sel, isToolbarVisible: sel !== null }),
  showToolbar: () => set({ isToolbarVisible: true }),
  hideToolbar: () => set({ isToolbarVisible: false }),
  setActiveLensAction: (action) => set({ activeLensAction: action }),
  setLensStreaming: (streaming) => set({ isLensStreaming: streaming }),
  openLensDirect: () => set({ isLensDirectOpen: true }),
  closeLensDirect: () => set({ isLensDirectOpen: false }),
  toggleLensDirect: () => set((state) => ({ isLensDirectOpen: !state.isLensDirectOpen })),
  clearLens: () => set({ selection: null, isToolbarVisible: false, activeLensAction: null, isLensStreaming: false }),
}));

