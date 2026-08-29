import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types';
import { AnswerSources } from '../citations/AnswerSources';

export const ChatMessage: React.FC<{ message: ChatMessageType; isStreaming?: boolean }> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const renderConfidenceBadge = () => {
    if (!message.confidence_level || isUser) return null;

    if (message.confidence_level.toLowerCase().includes('high')) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span>High Confidence (Grounded in PDF)</span>
        </div>
      );
    }

    if (message.confidence_level.toLowerCase().includes('medium')) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <AlertCircle size={12} className="text-amber-500" />
          <span>Medium Confidence (Includes Supplementary Context)</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-300 dark:border-surface-700">
        <HelpCircle size={12} className="text-surface-400" />
        <span>Low Confidence</span>
      </div>
    );
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm relative shadow-sm
        ${isUser 
          ? 'bg-primary-600 text-white rounded-br-sm' 
          : 'bg-surface-50 dark:bg-surface-800/90 text-surface-800 dark:text-surface-100 rounded-bl-sm border border-surface-200/80 dark:border-surface-700/60'
        }`}
      >
        {!isUser && (
          <button 
            onClick={copyToClipboard}
            className="absolute -right-8 top-2 p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy to clipboard"
          >
            <Copy size={14} />
          </button>
        )}

        {!isUser && renderConfidenceBadge()}
        
        {isUser ? (
          <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-primary-500 animate-pulse align-middle" />}
          </div>
        )}
      </div>
      
      {!isUser && message.citations && message.citations.length > 0 && (
        <div className="mt-2 pl-1 max-w-[85%]">
          <AnswerSources citations={message.citations} />
        </div>
      )}
    </div>
  );
};
