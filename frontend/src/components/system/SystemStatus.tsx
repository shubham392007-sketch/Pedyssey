import React from 'react';
import { useSystemStatus } from '../../hooks/useSystemStatus';
import type { ComponentStatus as ComponentStatusType } from '../../types';

export const SystemStatus: React.FC = () => {
  const { data: status, isLoading } = useSystemStatus();

  if (isLoading || !status) return <div className="text-surface-500">Loading system status...</div>;

  const components: ComponentStatusType[] = [
    status.backend, status.database, status.vector_store, status.ollama
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {components.map((comp) => (
        <div key={comp.name} className="p-4 border border-surface-200 dark:border-surface-800 rounded-lg bg-white dark:bg-surface-900">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-surface-800 dark:text-surface-200 capitalize">{comp.name.replace('_', ' ')}</h3>
            <StatusBadge status={comp.status} />
          </div>
          {comp.detail && <p className="text-xs text-surface-500 mt-2">{comp.detail}</p>}
        </div>
      ))}
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = {
    ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    loading: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    offline: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status.toUpperCase()}
    </span>
  );
};
