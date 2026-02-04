// Unified ticket creation types across all platforms

export interface TicketData {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  labels?: string[];
  assignee?: string;
  source?: {
    type: 'reddit' | 'twitter' | 'support' | 'call' | 'manual';
    url?: string;
    author?: string;
  };
}

export interface TicketResult {
  success: boolean;
  ticketId?: string;
  ticketUrl?: string;
  error?: string;
  platform: IntegrationPlatform;
}

export type IntegrationPlatform = 'linear' | 'jira' | 'notion' | 'github';

export interface IntegrationConfig {
  platform: IntegrationPlatform;
  apiKey?: string;
  accessToken?: string;
  baseUrl?: string; // For Jira cloud instances
  teamId?: string; // For Linear
  projectId?: string; // For Linear, Jira
  databaseId?: string; // For Notion
  owner?: string; // For GitHub
  repo?: string; // For GitHub
}

// OAuth callback response
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

// Stored integration state
export interface StoredIntegration {
  platform: IntegrationPlatform;
  connected: boolean;
  config: IntegrationConfig;
  connectedAt?: string;
  userInfo?: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
}

// Priority mapping for different platforms
export const PRIORITY_MAP = {
  linear: {
    low: 4,
    medium: 3,
    high: 2,
    urgent: 1,
  },
  jira: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Highest',
  },
  notion: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  },
  github: {
    low: ['low-priority'],
    medium: [],
    high: ['priority'],
    urgent: ['priority', 'urgent'],
  },
} as const;
