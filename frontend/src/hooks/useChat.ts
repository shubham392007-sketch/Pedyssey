import { useState } from 'react';
import { chatApi } from '../services/api';
import { useChatStore } from '../stores/useChatStore';
import type { Citation } from '../types';

export const useAskQuestion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage, setStreaming, currentSessionId } = useChatStore();

  const ask = async (question: string, documentIds: string[]) => {
    setIsLoading(true);
    setStreaming(true, '');
    let incomingCitations: Citation[] = [];
    
    // Optimistically add user message
    addMessage({
      id: crypto.randomUUID(),
      session_id: currentSessionId || 'new',
      role: 'user',
      content: question,
      created_at: new Date().toISOString()
    });

    try {
      const streamResult = await chatApi.askStream(
        question,
        documentIds,
        currentSessionId || undefined,
        (text) => {
          setStreaming(true, text);
        },
        (cites) => {
          incomingCitations = cites;
        }
      );
      
      addMessage({
        id: crypto.randomUUID(),
        session_id: currentSessionId || 'new',
        role: 'assistant',
        content: streamResult.content,
        citations: streamResult.citations && streamResult.citations.length > 0 ? streamResult.citations : incomingCitations,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        id: crypto.randomUUID(),
        session_id: currentSessionId || 'new',
        role: 'assistant',
        content: "Sorry, an error occurred while generating the response.",
        created_at: new Date().toISOString()
      });
    } finally {
      setStreaming(false, '');
      setIsLoading(false);
    }
  };

  return { ask, isLoading };
};
