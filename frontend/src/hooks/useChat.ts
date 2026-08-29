import { useState } from 'react';
import { chatApi } from '../services/api';
import { useChatStore } from '../stores/useChatStore';
import type { Citation, ResponseMode, ActionMode, ExplainLevel, StructuredChatData } from '../types';

export const useAskQuestion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('retrieving');
  const [liveFollowUps, setLiveFollowUps] = useState<string[]>([]);
  const { addMessage, setStreaming, currentSessionId } = useChatStore();

  const ask = async (
    question: string,
    documentIds: string[],
    mode: ResponseMode = 'quick',
    action?: ActionMode,
    explainLevel?: ExplainLevel,
    targetLanguage?: string,
    quizConfig?: Record<string, any>
  ) => {
    setIsLoading(true);
    setCurrentStage('retrieving');
    setStreaming(true, '');
    setLiveFollowUps([]);
    let incomingCitations: Citation[] = [];
    let incomingConfidence: { score: number; level: string; category: string; evidence_quality?: string } | undefined;
    let incomingFollowUps: string[] = [];
    let incomingStructuredData: StructuredChatData | null = null;
    
    // Optimistically add user message
    addMessage({
      id: crypto.randomUUID(),
      session_id: currentSessionId || 'new',
      role: 'user',
      content: question,
      mode,
      action,
      explain_level: explainLevel,
      created_at: new Date().toISOString()
    });

    try {
      const streamResult = await chatApi.askStream(
        question,
        documentIds,
        currentSessionId || undefined,
        mode,
        action,
        explainLevel,
        targetLanguage,
        quizConfig,
        (text) => {
          setStreaming(true, text);
        },
        (cites) => {
          incomingCitations = cites;
        },
        (conf) => {
          incomingConfidence = conf;
        },
        (stage) => {
          setCurrentStage(stage);
        },
        (fUps) => {
          incomingFollowUps = fUps;
          setLiveFollowUps(fUps);
        },
        (sData) => {
          incomingStructuredData = sData;
        }
      );
      
      addMessage({
        id: crypto.randomUUID(),
        session_id: currentSessionId || 'new',
        role: 'assistant',
        content: streamResult.content,
        confidence: streamResult.confidence ?? incomingConfidence?.score,
        confidence_level: streamResult.confidence_level ?? incomingConfidence?.level,
        category: streamResult.category ?? incomingConfidence?.category,
        evidence_quality: streamResult.evidence_quality ?? incomingConfidence?.evidence_quality,
        citations: streamResult.citations && streamResult.citations.length > 0 ? streamResult.citations : incomingCitations,
        mode: streamResult.mode ?? mode,
        action: streamResult.action ?? action,
        explain_level: streamResult.explain_level ?? explainLevel,
        duration_seconds: streamResult.duration_seconds,
        follow_ups: streamResult.follow_ups && streamResult.follow_ups.length > 0 ? streamResult.follow_ups : incomingFollowUps,
        structured_data: streamResult.structured_data ?? incomingStructuredData,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        id: crypto.randomUUID(),
        session_id: currentSessionId || 'new',
        role: 'assistant',
        content: "Sorry, an error occurred while generating the response from the local model.",
        mode,
        action,
        explain_level: explainLevel,
        created_at: new Date().toISOString()
      });
    } finally {
      setStreaming(false, '');
      setIsLoading(false);
    }
  };

  return { ask, isLoading, currentStage, liveFollowUps };
};
