import React from 'react';
import { TopBar } from './TopBar';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};
