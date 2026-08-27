import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAskQuestion } from '../../hooks/useChat';
import { useDocumentStore } from '../../stores/useDocumentStore';
import { useChatStore } from '../../stores/useChatStore';

export const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { ask, isLoading } = useAskQuestion();
  const { selectedDocIds } = useDocumentStore();
  const { isStreaming } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (!input.trim() || isLoading || isStreaming || selectedDocIds.size === 0) return;
    ask(input.trim(), Array.from(selectedDocIds));
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={selectedDocIds.size === 0 ? "Select documents to chat..." : "Ask a question..."}
        disabled={selectedDocIds.size === 0 || isLoading || isStreaming}
        className="w-full bg-surface-100 dark:bg-surface-800 border-none rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-1 focus:ring-primary-500 resize-none overflow-y-auto disabled:opacity-50"
        rows={1}
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || isLoading || isStreaming || selectedDocIds.size === 0}
        className="absolute right-2 bottom-2.5 p-1.5 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 dark:disabled:bg-surface-700 disabled:text-surface-500 transition-colors"
      >
        <Send size={16} />
      </button>
    </div>
  );
};
