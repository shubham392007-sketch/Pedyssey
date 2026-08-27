import axios from 'axios';
import type { Document, ProcessingStatus, ChatMessage, ChatSession, SystemStatus, Citation } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
});

export const documentApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<any>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  list: async (): Promise<Document[]> => {
    const { data } = await api.get<any>('/documents');
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.documents)) return data.documents;
    return [];
  },
  get: async (id: string) => {
    const { data } = await api.get<Document>(`/documents/${id}`);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/documents/${id}`);
  },
  process: async (id: string) => {
    const { data } = await api.post<ProcessingStatus>(`/documents/${id}/process`);
    return data;
  },
  getStatus: async (id: string) => {
    const { data } = await api.get<ProcessingStatus>(`/documents/${id}/status`);
    return data;
  },
  getFileUrl: (id: string) => `/api/v1/documents/${id}/file`,
};

export interface StreamResult {
  content: string;
  citations: Citation[];
}

export const chatApi = {
  getHistory: async (sessionId: string): Promise<ChatMessage[]> => {
    const { data } = await api.get<any>(`/chat/sessions/${sessionId}/messages`);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.messages)) return data.messages;
    return [];
  },
  deleteSession: async (sessionId: string) => {
    await api.delete(`/chat/sessions/${sessionId}`);
  },
  askStream: async (
    question: string,
    documentIds: string[],
    sessionId?: string,
    onMessage?: (text: string) => void,
    onCitations?: (citations: Citation[]) => void
  ): Promise<StreamResult> => {
    const response = await fetch('/api/v1/chat/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, document_ids: documentIds, session_id: sessionId, stream: true }),
    });

    if (!response.body) throw new Error('No readable stream');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let fullContent = '';
    let citations: Citation[] = [];

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                fullContent += data.content;
                onMessage?.(fullContent);
              }
              if (data.citations && Array.isArray(data.citations)) {
                citations = data.citations;
                onCitations?.(citations);
              }
            } catch (e) {
              console.error('Error parsing SSE chunk', e);
            }
          }
        }
      }
    }
    return { content: fullContent, citations };
  }
};

export const systemApi = {
  status: async () => {
    const { data } = await api.get<SystemStatus>('/system/status');
    return data;
  }
};

export const settingsApi = {
  get: async () => {
    const { data } = await api.get('/settings');
    return data;
  },
  update: async (settings: any) => {
    const { data } = await api.put('/settings', settings);
    return data;
  }
};
