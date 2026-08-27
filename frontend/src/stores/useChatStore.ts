import { create } from 'zustand';
import type { ChatMessage } from '../types';

interface ChatState {
  messages: ChatMessage[];
  currentSessionId: string | null;
  isStreaming: boolean;
  streamingContent: string;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setStreaming: (isStreaming: boolean, content?: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  currentSessionId: null,
  isStreaming: false,
  streamingContent: '',
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (messages) => set({ messages }),
  setStreaming: (isStreaming, content = '') => set({ isStreaming, streamingContent: content }),
  clearMessages: () => set({ messages: [], currentSessionId: null, isStreaming: false, streamingContent: '' }),
}));
