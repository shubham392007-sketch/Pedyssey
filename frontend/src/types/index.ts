export interface Document {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  page_count: number;
  status: string;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export interface ProcessingStatus {
  document_id: string;
  status: string;
  current_stage?: string;
  current_page?: number;
  total_pages?: number;
  progress?: number;
}

export interface Citation {
  document_id: string;
  filename: string;
  page_start: number;
  page_end: number;
  chunk_id: string;
  text_preview?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SystemStatus {
  backend: ComponentStatus;
  database: ComponentStatus;
  vector_store: ComponentStatus;
  embedding_model: ComponentStatus;
  reranker: ComponentStatus;
  ollama: ComponentStatus;
  llm_model: ComponentStatus;
  offline_mode: boolean;
}

export interface ComponentStatus {
  name: string;
  status: 'ready' | 'loading' | 'error' | 'offline';
  detail?: string;
}
