import axios from 'axios';
import type {
  Document, ProcessingStatus, ChatMessage,
  SystemStatus, Citation, OllamaHealth, LocalModelsResponse,
  ResponseMode, ActionMode, ExplainLevel, StructuredChatData
} from '../types';

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
  reindex: async (id: string) => {
    const { data } = await api.post<any>(`/documents/${id}/reindex`);
    return data;
  },
  reindexAll: async () => {
    const { data } = await api.post<any>('/documents/reindex-all');
    return data;
  },
  getStatus: async (id: string) => {
    const { data } = await api.get<ProcessingStatus>(`/documents/${id}/status`);
    return data;
  },
  getFileUrl: (id: string) => `/api/v1/documents/${id}/file`,
};

export interface DebugRetrievalResult {
  rank: number;
  chunk_id: string;
  document_id: string;
  page_start: number;
  page_end: number;
  snippet: string;
  reranker_score: number;
  raw_reranker_score: number;
  faiss_score?: number;
  bm25_score?: number;
}

export interface StreamResult {
  content: string;
  citations: Citation[];
  confidence?: number;
  confidence_level?: string;
  category?: string;
  mode?: ResponseMode;
  action?: ActionMode;
  explain_level?: ExplainLevel;
  duration_seconds?: number;
  evidence_quality?: string;
  follow_ups?: string[];
  structured_data?: StructuredChatData | null;
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
    mode: ResponseMode = 'quick',
    action?: ActionMode,
    explainLevel?: ExplainLevel,
    targetLanguage?: string,
    quizConfig?: Record<string, any>,
    onMessage?: (text: string) => void,
    onCitations?: (citations: Citation[]) => void,
    onConfidence?: (conf: { score: number; level: string; category: string; evidence_quality?: string }) => void,
    onStage?: (stage: string) => void,
    onFollowUps?: (followUps: string[]) => void,
    onStructuredData?: (data: StructuredChatData) => void
  ): Promise<StreamResult> => {
    const response = await fetch('/api/v1/chat/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question, 
        document_ids: documentIds, 
        session_id: sessionId, 
        stream: true, 
        mode,
        action,
        explain_level: explainLevel,
        target_language: targetLanguage,
        quiz_config: quizConfig
      }),
    });

    if (!response.body) throw new Error('No readable stream');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let fullContent = '';
    let citations: Citation[] = [];
    let confScore: number | undefined;
    let confLevel: string | undefined;
    let category: string | undefined;
    let evidenceQuality: string | undefined;
    let resultMode: ResponseMode = mode;
    let durationSeconds: number | undefined;
    let followUps: string[] | undefined;
    let structuredData: StructuredChatData | null = null;
    let lineBuffer = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        lineBuffer += decoder.decode(value, { stream: !done });
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() || '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || !line.startsWith('data:')) continue;

          const dataStr = line.replace(/^data:\s*/, '').trim();
          if (dataStr === '[DONE]') continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.event === 'confidence' && data.data) {
              confScore = data.data.score;
              confLevel = data.data.level;
              category = data.data.category;
              evidenceQuality = data.data.evidence_quality;
              onConfidence?.(data.data);
            } else if (data.event === 'citations' && Array.isArray(data.data)) {
              citations = data.data;
              onCitations?.(citations);
            } else if (data.citations && Array.isArray(data.citations)) {
              citations = data.citations;
              onCitations?.(citations);
            } else if (data.event === 'stage' && typeof data.data === 'string') {
              onStage?.(data.data);
            } else if (data.event === 'retrieving') {
              onStage?.('retrieving');
            } else if (data.event === 'reranking') {
              onStage?.('reranking');
            } else if (data.event === 'generating') {
              onStage?.('generating');
            } else if (data.event === 'complete' && data.data) {
              if (data.data.duration_seconds !== undefined) {
                durationSeconds = data.data.duration_seconds;
              }
              if (data.data.mode) {
                resultMode = data.data.mode;
              }
              if (data.data.evidence_quality) {
                evidenceQuality = data.data.evidence_quality;
              }
              if (data.data.follow_ups) {
                followUps = data.data.follow_ups;
                onFollowUps?.(data.data.follow_ups);
              }
              if (data.data.structured_data) {
                structuredData = data.data.structured_data;
                onStructuredData?.(data.data.structured_data);
              }
            }
            
            // Extract token content
            const token = data.content ?? (data.event === 'token' ? data.data : undefined);
            if (typeof token === 'string' && token.length > 0) {
              fullContent += token;
              onMessage?.(fullContent);
            }
          } catch (e) {
            console.error('Error parsing SSE chunk:', e, 'Raw chunk:', dataStr);
          }
        }
      }
    }

    return {
      content: fullContent,
      citations,
      confidence: confScore,
      confidence_level: confLevel,
      category,
      mode: resultMode,
      action,
      explain_level: explainLevel,
      duration_seconds: durationSeconds,
      evidence_quality: evidenceQuality,
      follow_ups: followUps,
      structured_data: structuredData,
    };
  },
  debugRetrieval: async (question: string, documentIds?: string[]) => {
    const { data } = await api.post<{ question: string; total_candidates: number; results: DebugRetrievalResult[] }>(
      '/chat/debug-retrieval',
      { question, document_ids: documentIds }
    );
    return data;
  },
};

export const systemApi = {
  status: async () => {
    const { data } = await api.get<SystemStatus>('/system/status');
    return data;
  },
  getOllamaHealth: async () => {
    const { data } = await api.get<OllamaHealth>('/system/ollama');
    return data;
  },
  getLocalModels: async () => {
    const { data } = await api.get<LocalModelsResponse>('/system/models');
    return data;
  },
  testOllama: async (prompt: string) => {
    const { data } = await api.post<{ response: string }>('/system/ollama/test', { prompt });
    return data;
  },
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

export const lensApi = {
  actionStream: async (
    selectedText: string,
    selectedPage: number,
    lensAction: string,
    documentIds: string[],
    sessionId?: string,
    mode: ResponseMode = 'quick',
    question?: string,
    targetLanguage?: string,
    onMessage?: (text: string) => void,
    onCitations?: (citations: Citation[]) => void,
    onConfidence?: (conf: { score: number; level: string; category: string; evidence_quality?: string }) => void,
    onStage?: (stage: string) => void,
    onFollowUps?: (followUps: string[]) => void,
    onStructuredData?: (data: StructuredChatData) => void
  ): Promise<StreamResult> => {
    const response = await fetch('/api/v1/lens/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selected_text: selectedText,
        selected_page: selectedPage,
        lens_action: lensAction,
        question,
        document_ids: documentIds,
        session_id: sessionId,
        mode,
        target_language: targetLanguage,
      }),
    });

    if (!response.body) throw new Error('No readable stream');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let fullContent = '';
    let citations: Citation[] = [];
    let confScore: number | undefined;
    let confLevel: string | undefined;
    let category: string | undefined;
    let evidenceQuality: string | undefined;
    let resultMode: ResponseMode = mode;
    let durationSeconds: number | undefined;
    let followUps: string[] | undefined;
    let structuredData: StructuredChatData | null = null;
    let lineBuffer = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        lineBuffer += decoder.decode(value, { stream: !done });
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() || '';

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || !line.startsWith('data:')) continue;

          const dataStr = line.replace(/^data:\s*/, '').trim();
          if (dataStr === '[DONE]') continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.event === 'confidence' && data.data) {
              confScore = data.data.score;
              confLevel = data.data.level;
              category = data.data.category;
              evidenceQuality = data.data.evidence_quality;
              onConfidence?.(data.data);
            } else if (data.event === 'citations' && Array.isArray(data.data)) {
              citations = data.data;
              onCitations?.(citations);
            } else if (data.citations && Array.isArray(data.citations)) {
              citations = data.citations;
              onCitations?.(citations);
            } else if (data.event === 'stage' && typeof data.data === 'string') {
              onStage?.(data.data);
            } else if (data.event === 'complete' && data.data) {
              if (data.data.duration_seconds !== undefined) {
                durationSeconds = data.data.duration_seconds;
              }
              if (data.data.mode) {
                resultMode = data.data.mode;
              }
              if (data.data.evidence_quality) {
                evidenceQuality = data.data.evidence_quality;
              }
              if (data.data.follow_ups) {
                followUps = data.data.follow_ups;
                onFollowUps?.(data.data.follow_ups);
              }
              if (data.data.structured_data) {
                structuredData = data.data.structured_data;
                onStructuredData?.(data.data.structured_data);
              }
            }

            const token = data.content ?? (data.event === 'token' ? data.data : undefined);
            if (typeof token === 'string' && token.length > 0) {
              fullContent += token;
              onMessage?.(fullContent);
            }
          } catch (e) {
            console.error('Error parsing Lens SSE chunk:', e, 'Raw:', dataStr);
          }
        }
      }
    }

    return {
      content: fullContent,
      citations,
      confidence: confScore,
      confidence_level: confLevel,
      category,
      mode: resultMode,
      duration_seconds: durationSeconds,
      evidence_quality: evidenceQuality,
      follow_ups: followUps,
      structured_data: structuredData,
    };
  },
};
