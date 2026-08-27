import { create } from 'zustand';
import type { Document } from '../types';

interface DocumentState {
  documents: Document[];
  selectedDocIds: Set<string>;
  activeDocId: string | null;
  setDocuments: (documents: Document[]) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setActiveDoc: (id: string | null) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  selectedDocIds: new Set(),
  activeDocId: null,
  setDocuments: (documents) => set({ documents }),
  toggleSelect: (id) =>
    set((state) => {
      const newSelected = new Set(state.selectedDocIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedDocIds: newSelected };
    }),
  selectAll: () => set((state) => ({ selectedDocIds: new Set(state.documents.map(d => d.id)) })),
  deselectAll: () => set({ selectedDocIds: new Set() }),
  setActiveDoc: (id) => set({ activeDocId: id }),
}));
