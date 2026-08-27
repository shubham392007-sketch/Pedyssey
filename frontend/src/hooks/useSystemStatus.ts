import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../services/api';

export const useSystemStatus = () => {
  return useQuery({
    queryKey: ['systemStatus'],
    queryFn: systemApi.status,
    refetchInterval: 30000,
  });
};
