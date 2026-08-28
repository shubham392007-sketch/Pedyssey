import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../../stores/useChatStore';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useAskQuestion } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export const ChatPanel: React.FC = () => {
  const { messages, isStreaming, streamingContent } = useChatStore();
  const { documents, selectedDocIds, activeDocId } = useDocumentStore();
  const { ask } = useAskQuestion();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSampleClick = (question: string) => {
    let targetDocIds: string[] = [];
    if (selectedDocIds.size > 0) {
      targetDocIds = Array.from(selectedDocIds);
    } else if (activeDocId) {
      targetDocIds = [activeDocId];
    } else if (documents.length > 0) {
      targetDocIds = documents.map((d) => d.id);
    }

    if (targetDocIds.length === 0) {
      alert('Please upload a PDF document first.');
      return;
    }
    ask(question, targetDocIds);
  };

  return (
    <div className="w-[400px] flex flex-col border-l border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shrink-0">
      <div className="h-14 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 font-medium text-surface-800 dark:text-surface-200 shrink-0">
        <span>Pedyssey AI</span>
        {selectedDocIds.size > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-normal">
            {selectedDocIds.size} doc{selectedDocIds.size > 1 ? 's' : ''} active
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-surface-500 space-y-4">
            <p className="text-sm font-medium text-surface-600 dark:text-surface-400">Ask anything about your documents</p>
            <div className="space-y-2 w-full max-w-xs">
              <div 
                onClick={() => handleSampleClick("Summarize the key points in this document")}
                className="p-3 text-xs bg-surface-100 dark:bg-surface-800 rounded-lg text-center cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-surface-700 dark:text-surface-300"
              >
                "Summarize the key points in this document"
              </div>
              <div 
                onClick={() => handleSampleClick("What are the main topics and conclusions?")}
                className="p-3 text-xs bg-surface-100 dark:bg-surface-800 rounded-lg text-center cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-surface-700 dark:text-surface-300"
              >
                "What are the main topics and conclusions?"
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        
        {isStreaming && streamingContent && (
          <ChatMessage 
            message={{ 
              id: 'streaming', 
              role: 'assistant', 
              content: streamingContent,
              session_id: '',
              created_at: new Date().toISOString()
            }} 
            isStreaming 
          />
        )}
        <div ref={bottomRef} />
      </div>
      
      <div className="p-4 border-t border-surface-200 dark:border-surface-800 shrink-0">
        <ChatInput />
      </div>
    </div>
  );
};
