// Linear API Integration
// Docs: https://developers.linear.app/docs

import { TicketData, TicketResult, IntegrationConfig, PRIORITY_MAP } from './types';

const LINEAR_API_URL = 'https://api.linear.app/graphql';

interface LinearIssueResponse {
  data?: {
    issueCreate?: {
      success: boolean;
      issue?: {
        id: string;
        identifier: string;
        url: string;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export async function createLinearIssue(
  ticket: TicketData,
  config: IntegrationConfig
): Promise<TicketResult> {
  if (!config.accessToken) {
    return {
      success: false,
      error: 'Linear access token not configured',
      platform: 'linear',
    };
  }

  if (!config.teamId) {
    return {
      success: false,
      error: 'Linear team ID not configured',
      platform: 'linear',
    };
  }

  const mutation = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          url
        }
      }
    }
  `;

  // Build description with source attribution
  let description = ticket.description;
  if (ticket.source) {
    description += `\n\n---\n**Source:** ${ticket.source.type}`;
    if (ticket.source.author) description += ` by ${ticket.source.author}`;
    if (ticket.source.url) description += `\n[View original](${ticket.source.url})`;
    description += '\n\n_Created via Lark AI_';
  }

  const input: Record<string, unknown> = {
    teamId: config.teamId,
    title: ticket.title,
    description,
  };

  // Add priority if specified
  if (ticket.priority) {
    input.priority = PRIORITY_MAP.linear[ticket.priority];
  }

  // Add labels if specified
  if (ticket.labels && ticket.labels.length > 0) {
    input.labelIds = ticket.labels;
  }

  // Add project if configured
  if (config.projectId) {
    input.projectId = config.projectId;
  }

  try {
    const response = await fetch(LINEAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: config.accessToken,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input },
      }),
    });

    const data: LinearIssueResponse = await response.json();

    if (data.errors && data.errors.length > 0) {
      return {
        success: false,
        error: data.errors[0].message,
        platform: 'linear',
      };
    }

    if (data.data?.issueCreate?.success && data.data.issueCreate.issue) {
      return {
        success: true,
        ticketId: data.data.issueCreate.issue.identifier,
        ticketUrl: data.data.issueCreate.issue.url,
        platform: 'linear',
      };
    }

    return {
      success: false,
      error: 'Failed to create Linear issue',
      platform: 'linear',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform: 'linear',
    };
  }
}

// Fetch teams for configuration
export async function getLinearTeams(accessToken: string) {
  const query = `
    query {
      teams {
        nodes {
          id
          name
          key
        }
      }
    }
  `;

  const response = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return data.data?.teams?.nodes || [];
}

// Fetch projects for a team
export async function getLinearProjects(accessToken: string, teamId: string) {
  const query = `
    query($teamId: String!) {
      team(id: $teamId) {
        projects {
          nodes {
            id
            name
            state
          }
        }
      }
    }
  `;

  const response = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables: { teamId } }),
  });

  const data = await response.json();
  return data.data?.team?.projects?.nodes || [];
}
