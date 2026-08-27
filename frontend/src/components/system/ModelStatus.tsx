import React from 'react';
import type { ComponentStatus } from '../../types';

export const ModelStatus: React.FC<{ model: ComponentStatus, title: string }> = ({ model, title }) => {
  return (
    <div className="p-4 border border-surface-200 dark:border-surface-800 rounded-lg bg-white dark:bg-surface-900 flex justify-between items-center">
      <div>
        <h4 className="text-sm font-medium text-surface-800 dark:text-surface-200">{title}</h4>
        <p className="text-xs text-surface-500 mt-1">{model.detail || model.name}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${model.status === 'ready' ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs capitalize text-surface-600 dark:text-surface-400">{model.status}</span>
      </div>
    </div>
  );
};
