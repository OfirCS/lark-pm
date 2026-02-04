// GitHub Issues API Integration
// Docs: https://docs.github.com/en/rest/issues

import { TicketData, TicketResult, IntegrationConfig, PRIORITY_MAP } from './types';

interface GitHubIssueResponse {
  id: number;
  number: number;
  html_url: string;
  title: string;
  state: string;
}

interface GitHubErrorResponse {
  message: string;
  documentation_url?: string;
}

export async function createGitHubIssue(
  ticket: TicketData,
  config: IntegrationConfig
): Promise<TicketResult> {
  if (!config.accessToken) {
    return {
      success: false,
      error: 'GitHub access token not configured',
      platform: 'github',
    };
  }

  if (!config.owner || !config.repo) {
    return {
      success: false,
      error: 'GitHub owner/repo not configured',
      platform: 'github',
    };
  }

  const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/issues`;

  // Build body with source attribution
  let body = ticket.description;
  if (ticket.source) {
    body += `\n\n---\n**Source:** ${ticket.source.type}`;
    if (ticket.source.author) body += ` by @${ticket.source.author}`;
    if (ticket.source.url) body += `\n🔗 [View original](${ticket.source.url})`;
    body += '\n\n_Created via Lark AI_ 🐦';
  }

  // Build labels array
  const labels: string[] = ticket.labels ? [...ticket.labels] : [];

  // Add priority labels
  if (ticket.priority) {
    const priorityLabels = PRIORITY_MAP.github[ticket.priority];
    labels.push(...priorityLabels);
  }

  // Add source type as label
  if (ticket.source?.type) {
    labels.push(`source:${ticket.source.type}`);
  }

  const issueData: Record<string, unknown> = {
    title: ticket.title,
    body,
    labels,
  };

  // Add assignee if specified
  if (ticket.assignee) {
    issueData.assignees = [ticket.assignee];
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.accessToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    });

    if (!response.ok) {
      const error: GitHubErrorResponse = await response.json();
      return {
        success: false,
        error: error.message || `GitHub API error: ${response.status}`,
        platform: 'github',
      };
    }

    const issue: GitHubIssueResponse = await response.json();

    return {
      success: true,
      ticketId: `#${issue.number}`,
      ticketUrl: issue.html_url,
      platform: 'github',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform: 'github',
    };
  }
}

// Fetch repositories for configuration
export async function getGitHubRepos(accessToken: string) {
  const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) return [];

  const repos = await response.json();
  return repos.map((repo: { full_name: string; name: string; owner: { login: string } }) => ({
    fullName: repo.full_name,
    name: repo.name,
    owner: repo.owner.login,
  }));
}

// Fetch labels for a repository
export async function getGitHubLabels(accessToken: string, owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/labels`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) return [];

  return response.json();
}
