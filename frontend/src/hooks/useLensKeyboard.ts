import { useEffect } from 'react';
import { useLensStore } from '../stores/useLensStore';

/**
 * Global keyboard shortcuts for Pedyssey Lens.
 * - Esc: Dismiss toolbar, clear selection
 * - Ctrl+Enter: Send selection as "Ask" action (handled in LensToolbar)
 * - Arrow Left/Right: Navigate between Lens action buttons (handled in LensToolbar)
 */
export const useLensKeyboard = () => {
  const { isToolbarVisible, clearLens } = useLensStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Esc to dismiss Lens
      if (e.key === 'Escape' && isToolbarVisible) {
        e.preventDefault();
        clearLens();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isToolbarVisible, clearLens]);
};
