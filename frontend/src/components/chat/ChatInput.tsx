import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAskQuestion } from '../../hooks/useChat';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useChatStore } from '../../stores/useChatStore';

export const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { ask, isLoading } = useAskQuestion();
  const { selectedDocIds, activeDocId, documents } = useDocumentStore();
  const { isStreaming } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const readyDocuments = documents.filter(
    (d) => d.status.toLowerCase() === 'ready' || d.status.toUpperCase() === 'READY'
  );

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading || isStreaming) return;

    let targetDocIds: string[] = [];
    if (selectedDocIds.size > 0) {
      targetDocIds = Array.from(selectedDocIds);
    } else if (activeDocId) {
      targetDocIds = [activeDocId];
    } else if (readyDocuments.length > 0) {
      targetDocIds = readyDocuments.map((d) => d.id);
    } else if (documents.length > 0) {
      targetDocIds = documents.map((d) => d.id);
    }

    if (targetDocIds.length === 0) {
      alert('Please upload a PDF document before asking a question.');
      return;
    }

    ask(input.trim(), targetDocIds);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasDocs = documents.length > 0;

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          !hasDocs
            ? 'Upload a PDF to start chatting...'
            : selectedDocIds.size > 0
            ? `Ask a question about ${selectedDocIds.size} selected document(s)...`
            : 'Ask a question about your documents...'
        }
        disabled={!hasDocs || isLoading || isStreaming}
        className="w-full bg-surface-100 dark:bg-surface-800 border-none rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-1 focus:ring-primary-500 resize-none overflow-y-auto disabled:opacity-50 text-surface-900 dark:text-surface-100 placeholder-surface-400"
        rows={1}
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || isLoading || isStreaming || !hasDocs}
        className="absolute right-2 bottom-2.5 p-1.5 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 dark:disabled:bg-surface-700 disabled:text-surface-500 transition-colors"
        title="Send Question"
      >
        <Send size={16} />
      </button>
    </div>
  );
};
