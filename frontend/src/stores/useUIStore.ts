import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  sidebarWidth: number;
  pdfPage: number;
  pdfZoom: number;
  toggleTheme: () => void;
  setSidebarWidth: (w: number) => void;
  setPdfPage: (page: number) => void;
  setPdfZoom: (zoom: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  sidebarWidth: 280,
  pdfPage: 1,
  pdfZoom: 1,
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    return { theme: newTheme };
  }),
  setSidebarWidth: (w) => set({ sidebarWidth: w }),
  setPdfPage: (page) => set({ pdfPage: page }),
  setPdfZoom: (zoom) => set({ pdfZoom: zoom }),
}));
