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
  setDocuments: (documents) =>
    set((state) => {
      const validDocIds = new Set(documents.map((d) => d.id));
      
      // Retain activeDocId only if it still exists in documents; otherwise default to the first document
      let nextActiveDocId: string | null = null;
      if (state.activeDocId && validDocIds.has(state.activeDocId)) {
        nextActiveDocId = state.activeDocId;
      } else if (documents.length > 0) {
        nextActiveDocId = documents[0].id;
      }

      // Clean up selectedDocIds
      const newSelected = new Set(
        Array.from(state.selectedDocIds).filter((id) => validDocIds.has(id))
      );
      // If nothing selected and documents exist, select active doc by default
      if (newSelected.size === 0 && nextActiveDocId) {
        newSelected.add(nextActiveDocId);
      }

      return {
        documents,
        activeDocId: nextActiveDocId,
        selectedDocIds: newSelected,
      };
    }),
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
  selectAll: () =>
    set((state) => ({ selectedDocIds: new Set(state.documents.map((d) => d.id)) })),
  deselectAll: () => set({ selectedDocIds: new Set() }),
  setActiveDoc: (id) => set({ activeDocId: id }),
}));
