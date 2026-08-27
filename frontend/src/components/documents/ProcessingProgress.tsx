import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { ProcessingStatus } from '../../types';

export const ProcessingProgress: React.FC<{ status: ProcessingStatus }> = ({ status }) => {
  const stages = ['validating', 'extracting', 'chunking', 'embedding', 'indexing'];
  
  const currentStageIndex = stages.indexOf(status.current_stage || 'validating');

  return (
    <div className="space-y-2 text-xs">
      {stages.map((stage, idx) => {
        const isCompleted = idx < currentStageIndex || status.status === 'ready';
        const isCurrent = idx === currentStageIndex && status.status !== 'ready';
        
        return (
          <div key={stage} className={`flex items-center gap-2 ${isCompleted || isCurrent ? 'text-surface-700 dark:text-surface-300' : 'text-surface-400 dark:text-surface-600'}`}>
            {isCompleted ? (
              <Check size={14} className="text-green-500" />
            ) : isCurrent ? (
              <Loader2 size={14} className="animate-spin text-primary-500" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-surface-300 dark:border-surface-700" />
            )}
            <span className="capitalize">{stage}</span>
            {isCurrent && status.progress !== undefined && (
              <span className="ml-auto">{Math.round(status.progress * 100)}%</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
