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

export type ResponseMode = 
  | 'quick' 
  | 'think' 
  | 'deep_research' 
  | 'study' 
  | 'research' 
  | 'explain' 
  | 'compare' 
  | 'analyze' 
  | 'verify';

export type ActionMode = 
  | 'summarize' 
  | 'quiz' 
  | 'flashcards' 
  | 'tutor' 
  | 'extract' 
  | 'review' 
  | 'write' 
  | 'translate';

export type ExplainLevel = 'beginner' | 'intermediate' | 'technical' | 'expert';

export interface Flashcard {
  front: string;
  back: string;
  page?: number;
  topic?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  page?: number;
  topic?: string;
}

export interface StructuredChatData {
  type: 'flashcards' | 'quiz' | 'verification' | 'table';
  items?: Flashcard[];
  questions?: QuizQuestion[];
  verdict?: 'SUPPORTED' | 'PARTIALLY SUPPORTED' | 'CONTRADICTED' | 'INSUFFICIENT EVIDENCE';
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  confidence_level?: string;
  category?: string;
  citations?: Citation[];
  mode?: ResponseMode;
  action?: ActionMode;
  explain_level?: ExplainLevel;
  duration_seconds?: number;
  evidence_quality?: string;
  follow_ups?: string[];
  structured_data?: StructuredChatData | null;
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

export interface OllamaHealth {
  status: 'ready' | 'unavailable' | 'model_missing';
  ollama: boolean;
  base_url?: string | null;
  model: string;
}

export interface LocalModelItem {
  name: string;
  size?: number;
  modified_at?: string;
}

export interface LocalModelsResponse {
  models: LocalModelItem[];
}
