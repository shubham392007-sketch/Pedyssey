import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../services/api';
import { useDocumentStore } from '../stores/useDocumentStore';

export const useDocuments = () => {
  const setDocuments = useDocumentStore(state => state.setDocuments);
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const data = await documentApi.list();
      setDocuments(data);
      return data;
    }
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
};

export const useProcessDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentApi.process,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
};

export const useProcessingStatus = (docId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['documentStatus', docId],
    queryFn: () => documentApi.getStatus(docId),
    enabled,
    refetchInterval: (data) => {
      return data?.state?.data?.status === 'processing' || data?.state?.data?.status === 'pending' ? 1000 : false;
    }
  });
};
