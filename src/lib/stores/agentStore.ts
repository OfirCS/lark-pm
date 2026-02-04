import { create } from 'zustand';
import type { AgentMessage, DashboardContext, StreamChunk } from '@/types/agent';

interface AgentStore {
  // State
  isOpen: boolean;
  messages: AgentMessage[];
  isStreaming: boolean;
  currentContext: DashboardContext | null;
  inputValue: string;

  // Actions
  openAgent: (context?: DashboardContext) => void;
  closeAgent: () => void;
  toggleAgent: () => void;
  setInputValue: (value: string) => void;

  // Message actions
  addMessage: (message: AgentMessage) => void;
  updateMessage: (id: string, updates: Partial<AgentMessage>) => void;
  appendToMessage: (id: string, text: string) => void;
  clearMessages: () => void;

  // Streaming
  setStreaming: (streaming: boolean) => void;

  // Context actions
  setContext: (context: DashboardContext | null) => void;

  // Convenience actions
  analyzeFeature: (featureId: number, featureName: string) => void;
  explainSentiment: (period: string) => void;
  compareCompetitor: (name: string) => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  // Initial state
  isOpen: false,
  messages: [],
  isStreaming: false,
  currentContext: null,
  inputValue: '',

  // Basic actions
  openAgent: (context) => set({ isOpen: true, currentContext: context || null }),
  closeAgent: () => set({ isOpen: false }),
  toggleAgent: () => set((state) => ({ isOpen: !state.isOpen })),
  setInputValue: (value) => set({ inputValue: value }),

  // Message actions
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === id ? { ...msg, ...updates } : msg
    ),
  })),

  appendToMessage: (id, text) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === id ? { ...msg, content: msg.content + text } : msg
    ),
  })),

  clearMessages: () => set({ messages: [] }),

  // Streaming
  setStreaming: (streaming) => set({ isStreaming: streaming }),

  // Context
  setContext: (context) => set({ currentContext: context }),

  // Convenience actions for dashboard integration
  analyzeFeature: (featureId, featureName) => {
    const { openAgent, addMessage } = get();
    openAgent({
      type: 'feature_request',
      featureId,
      featureName,
    });
    // Auto-send a message asking about the feature
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content: `Tell me more about the "${featureName}" feature request. What are customers saying?`,
      timestamp: new Date(),
    });
  },

  explainSentiment: (period) => {
    const { openAgent, addMessage } = get();
    openAgent({
      type: 'sentiment',
      timeRange: period,
    });
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content: `Explain the sentiment trends for the ${period}. What's driving the changes?`,
      timestamp: new Date(),
    });
  },

  compareCompetitor: (name) => {
    const { openAgent, addMessage } = get();
    openAgent({
      type: 'competitor',
      competitorName: name,
    });
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content: `How are we comparing to ${name}? What are customers saying about them vs us?`,
      timestamp: new Date(),
    });
  },
}));

// Helper to generate unique message IDs
export const generateMessageId = () => crypto.randomUUID();

// Helper to create a user message
export const createUserMessage = (content: string): AgentMessage => ({
  id: generateMessageId(),
  role: 'user',
  type: 'text',
  content,
  timestamp: new Date(),
});

// Helper to create an agent message
export const createAgentMessage = (
  type: AgentMessage['type'],
  content: string,
  data?: AgentMessage['data']
): AgentMessage => ({
  id: generateMessageId(),
  role: 'agent',
  type,
  content,
  data,
  timestamp: new Date(),
});
