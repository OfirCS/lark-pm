// Unified integrations module
// Exposes a single interface for creating tickets across all platforms

export * from './types';
export { createLinearIssue, getLinearTeams, getLinearProjects } from './linear';
export { createGitHubIssue, getGitHubRepos, getGitHubLabels } from './github';
export { createJiraIssue, getJiraProjects, getJiraIssueTypes } from './jira';
export { createNotionPage, getNotionDatabases, getNotionDatabaseSchema } from './notion';

import { TicketData, TicketResult, IntegrationConfig, IntegrationPlatform } from './types';
import { createLinearIssue } from './linear';
import { createGitHubIssue } from './github';
import { createJiraIssue } from './jira';
import { createNotionPage } from './notion';

/**
 * Create a ticket on the specified platform
 * This is the main entry point for ticket creation
 */
export async function createTicket(
  platform: IntegrationPlatform,
  ticket: TicketData,
  config: IntegrationConfig
): Promise<TicketResult> {
  switch (platform) {
    case 'linear':
      return createLinearIssue(ticket, config);
    case 'github':
      return createGitHubIssue(ticket, config);
    case 'jira':
      return createJiraIssue(ticket, config);
    case 'notion':
      return createNotionPage(ticket, config);
    default:
      return {
        success: false,
        error: `Unsupported platform: ${platform}`,
        platform,
      };
  }
}

/**
 * Create tickets on multiple platforms at once
 */
export async function createTicketMultiPlatform(
  ticket: TicketData,
  configs: IntegrationConfig[]
): Promise<TicketResult[]> {
  const results = await Promise.all(
    configs.map((config) => createTicket(config.platform, ticket, config))
  );
  return results;
}

/**
 * Platform display names and metadata
 */
export const PLATFORM_INFO: Record<
  IntegrationPlatform,
  { name: string; icon: string; color: string }
> = {
  linear: { name: 'Linear', icon: '📐', color: '#5E6AD2' },
  github: { name: 'GitHub Issues', icon: '🐙', color: '#24292f' },
  jira: { name: 'Jira', icon: '📋', color: '#0052CC' },
  notion: { name: 'Notion', icon: '📝', color: '#000000' },
};
