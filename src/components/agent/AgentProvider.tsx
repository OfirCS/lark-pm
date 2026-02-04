'use client';

import { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { useAgentStore, createUserMessage, createAgentMessage } from '@/lib/stores/agentStore';
import type { AgentMessage, StreamChunk, MessageData } from '@/types/agent';

interface AgentContextValue {
  sendMessage: (content: string) => Promise<void>;
  selectOption: (optionId: string) => Promise<void>;
  cancelStreaming: () => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within AgentProvider');
  }
  return context;
}

interface AgentProviderProps {
  children: ReactNode;
}

export function AgentProvider({ children }: AgentProviderProps) {
  const {
    messages,
    currentContext,
    addMessage,
    updateMessage,
    appendToMessage,
    setStreaming,
    setInputValue,
  } = useAgentStore();

  // Handle keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useAgentStore.getState().toggleAgent();
      }
      // Escape to close
      if (e.key === 'Escape' && useAgentStore.getState().isOpen) {
        useAgentStore.getState().closeAgent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage = createUserMessage(content);
    addMessage(userMessage);
    setInputValue('');
    setStreaming(true);

    // Create placeholder for agent response
    const agentMessageId = crypto.randomUUID();
    addMessage({
      id: agentMessageId,
      role: 'agent',
      type: 'thinking',
      content: '',
      data: {
        thinkingSteps: [
          { id: '1', text: 'Understanding your question...', status: 'in_progress', timestamp: new Date() },
        ],
      },
      timestamp: new Date(),
      streaming: true,
    });

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: currentContext,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamChunk = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'thinking':
                  updateMessage(agentMessageId, {
                    type: 'thinking',
                    data: {
                      thinkingSteps: data.data?.steps as MessageData['thinkingSteps'],
                    },
                  });
                  break;

                case 'text':
                  fullContent += data.content || '';
                  updateMessage(agentMessageId, {
                    type: 'text',
                    content: fullContent,
                  });
                  break;

                case 'options':
                  updateMessage(agentMessageId, {
                    type: 'options',
                    content: data.content || 'Please select an option:',
                    data: { options: data.data?.options as MessageData['options'] },
                  });
                  break;

                case 'search_progress':
                  updateMessage(agentMessageId, {
                    type: 'search_progress',
                    content: 'Searching...',
                    data: { searchProgress: data.data?.progress as MessageData['searchProgress'] },
                  });
                  break;

                case 'results':
                  updateMessage(agentMessageId, {
                    type: 'search_results',
                    content: data.content || '',
                    data: {
                      results: data.data?.results as MessageData['results'],
                      sentiment: data.data?.sentiment as MessageData['sentiment'],
                    },
                  });
                  break;

                case 'impact':
                  updateMessage(agentMessageId, {
                    type: 'impact_analysis',
                    content: '',
                    data: { impact: data.data?.impact as MessageData['impact'] },
                  });
                  break;
              }
            } catch (e) {
              console.error('Failed to parse chunk:', e);
            }
          }
        }
      }

      // Mark as no longer streaming
      updateMessage(agentMessageId, { streaming: false });
    } catch (error) {
      console.error('Agent error:', error);
      updateMessage(agentMessageId, {
        type: 'text',
        content: 'Sorry, I encountered an error. Please try again.',
        streaming: false,
      });
    } finally {
      setStreaming(false);
    }
  }, [messages, currentContext, addMessage, updateMessage, setStreaming, setInputValue]);

  const selectOption = useCallback(async (optionId: string) => {
    // Find the last options message and get the selected option
    const optionsMessage = [...messages].reverse().find(m => m.type === 'options');
    const option = optionsMessage?.data?.options?.find(o => o.id === optionId);

    if (option) {
      // Send as a user message
      await sendMessage(option.label);
    }
  }, [messages, sendMessage]);

  const cancelStreaming = useCallback(() => {
    setStreaming(false);
  }, [setStreaming]);

  return (
    <AgentContext.Provider value={{ sendMessage, selectOption, cancelStreaming }}>
      {children}
    </AgentContext.Provider>
  );
}
