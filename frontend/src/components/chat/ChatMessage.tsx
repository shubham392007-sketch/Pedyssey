import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types';
import { AnswerSources } from '../citations/AnswerSources';

export const ChatMessage: React.FC<{ message: ChatMessageType, isStreaming?: boolean }> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm relative
        ${isUser 
          ? 'bg-primary-600 text-white rounded-br-sm' 
          : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-bl-sm'
        }`}
      >
        {!isUser && (
          <button 
            onClick={copyToClipboard}
            className="absolute -right-8 top-2 p-1 text-surface-400 hover:text-surface-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy size={14} />
          </button>
        )}
        
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-surface-500 animate-pulse" />}
          </div>
        )}
      </div>
      
      {!isUser && message.citations && message.citations.length > 0 && (
        <div className="mt-2 pl-2">
          <AnswerSources citations={message.citations} />
        </div>
      )}
    </div>
  );
};
