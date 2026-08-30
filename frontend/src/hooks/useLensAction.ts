import { useState } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { useLensStore } from '../stores/useLensStore';
import type { Citation, ResponseMode, StructuredChatData } from '../types';
import type { LensAction } from '../stores/useLensStore';
import type { StreamResult } from '../services/api';
import { lensApi } from '../services/api';

const ACTION_LABELS: Record<LensAction, string> = {
  ask: 'Ask',
  explain: 'Explain',
  analyze: 'Analyze',
  verify: 'Verify',
  compare: 'Compare',
  find_evidence: 'Find Evidence',
  summarize: 'Summarize',
  translate: 'Translate',
  create_notes: 'Create Notes',
};

export const useLensAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('retrieving');
  const { addMessage, setStreaming, currentSessionId } = useChatStore();
  const { selection, setLensStreaming, clearLens } = useLensStore();

  const executeLensAction = async (
    action: LensAction,
    documentIds: string[],
    mode: ResponseMode = 'quick',
    askQuestion?: string,
    targetLanguage?: string,
  ) => {
    if (!selection) return;

    setIsLoading(true);
    setCurrentStage('retrieving');
    setStreaming(true, '');
    setLensStreaming(true);

    const actionLabel = ACTION_LABELS[action];
    const selPreview = selection.text.length > 100
      ? selection.text.slice(0, 100) + '...'
      : selection.text;

    // Build user message content
    let userContent = `[Lens · ${actionLabel} · p.${selection.page}] "${selPreview}"`;
    if (askQuestion) {
      userContent += `\n\n${askQuestion}`;
    }

    // Optimistically add user message
    addMessage({
      id: crypto.randomUUID(),
      session_id: currentSessionId || 'new',
      role: 'user',
      content: userContent,
      mode,
      created_at: new Date().toISOString(),
    });

    let incomingCitations: Citation[] = [];
    let incomingConfidence: { score: number; level: string; category: string; evidence_quality?: string } | undefined;
    let incomingFollowUps: string[] = [];
    let incomingStructuredData: StructuredChatData | null = null;

    try {
      const streamResult: StreamResult = await lensApi.actionStream(
        selection.text,
        selection.page,
        action,
        documentIds,
        currentSessionId || undefined,
        mode,
        askQuestion,
        targetLanguage,
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
        citations: streamResult.citations?.length ? streamResult.citations : incomingCitations,
        mode: streamResult.mode ?? mode,
        duration_seconds: streamResult.duration_seconds,
        follow_ups: streamResult.follow_ups?.length ? streamResult.follow_ups : incomingFollowUps,
        structured_data: streamResult.structured_data ?? incomingStructuredData,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Lens action error:', error);
      addMessage({
        id: crypto.randomUUID(),
        session_id: currentSessionId || 'new',
        role: 'assistant',
        content: 'Sorry, an error occurred while processing the Lens action with the local model.',
        mode,
        created_at: new Date().toISOString(),
      });
    } finally {
      setStreaming(false, '');
      setIsLoading(false);
      setLensStreaming(false);
      clearLens();
    }
  };

  return { executeLensAction, isLoading, currentStage };
};
