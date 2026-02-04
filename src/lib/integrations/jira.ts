// Jira Cloud API Integration
// Docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/

import { TicketData, TicketResult, IntegrationConfig, PRIORITY_MAP } from './types';

interface JiraIssueResponse {
  id: string;
  key: string;
  self: string;
}

interface JiraErrorResponse {
  errorMessages?: string[];
  errors?: Record<string, string>;
}

export async function createJiraIssue(
  ticket: TicketData,
  config: IntegrationConfig
): Promise<TicketResult> {
  if (!config.accessToken) {
    return {
      success: false,
      error: 'Jira access token not configured',
      platform: 'jira',
    };
  }

  if (!config.baseUrl || !config.projectId) {
    return {
      success: false,
      error: 'Jira instance URL or project not configured',
      platform: 'jira',
    };
  }

  const apiUrl = `${config.baseUrl}/rest/api/3/issue`;

  // Build description with source attribution (Jira uses ADF format)
  const descriptionContent = [];

  // Main description paragraph
  descriptionContent.push({
    type: 'paragraph',
    content: [{ type: 'text', text: ticket.description }],
  });

  // Source attribution
  if (ticket.source) {
    descriptionContent.push({
      type: 'rule',
    });

    const sourceText = [`Source: ${ticket.source.type}`];
    if (ticket.source.author) sourceText.push(` by ${ticket.source.author}`);

    descriptionContent.push({
      type: 'paragraph',
      content: [
        { type: 'text', text: sourceText.join(''), marks: [{ type: 'strong' }] },
      ],
    });

    if (ticket.source.url) {
      descriptionContent.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'View original',
            marks: [{ type: 'link', attrs: { href: ticket.source.url } }],
          },
        ],
      });
    }

    descriptionContent.push({
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Created via Lark AI', marks: [{ type: 'em' }] },
      ],
    });
  }

  const issueData: Record<string, unknown> = {
    fields: {
      project: { key: config.projectId },
      summary: ticket.title,
      description: {
        type: 'doc',
        version: 1,
        content: descriptionContent,
      },
      issuetype: { name: 'Task' },
    },
  };

  // Add priority if specified
  if (ticket.priority) {
    (issueData.fields as Record<string, unknown>).priority = {
      name: PRIORITY_MAP.jira[ticket.priority],
    };
  }

  // Add labels if specified
  if (ticket.labels && ticket.labels.length > 0) {
    (issueData.fields as Record<string, unknown>).labels = ticket.labels;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${config.accessToken}`, // Base64(email:api_token)
      },
      body: JSON.stringify(issueData),
    });

    if (!response.ok) {
      const error: JiraErrorResponse = await response.json();
      const errorMsg =
        error.errorMessages?.[0] ||
        Object.values(error.errors || {})[0] ||
        `Jira API error: ${response.status}`;
      return {
        success: false,
        error: errorMsg,
        platform: 'jira',
      };
    }

    const issue: JiraIssueResponse = await response.json();

    return {
      success: true,
      ticketId: issue.key,
      ticketUrl: `${config.baseUrl}/browse/${issue.key}`,
      platform: 'jira',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform: 'jira',
    };
  }
}

// Fetch projects for configuration
export async function getJiraProjects(baseUrl: string, accessToken: string) {
  const response = await fetch(`${baseUrl}/rest/api/3/project/search`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${accessToken}`,
    },
  });

  if (!response.ok) return [];

  const data = await response.json();
  return data.values || [];
}

// Fetch issue types for a project
export async function getJiraIssueTypes(
  baseUrl: string,
  accessToken: string,
  projectKey: string
) {
  const response = await fetch(
    `${baseUrl}/rest/api/3/issue/createmeta/${projectKey}/issuetypes`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${accessToken}`,
      },
    }
  );

  if (!response.ok) return [];

  const data = await response.json();
  return data.issueTypes || [];
}
