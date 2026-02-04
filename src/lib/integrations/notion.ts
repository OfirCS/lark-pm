// Notion API Integration
// Docs: https://developers.notion.com/reference

import { TicketData, TicketResult, IntegrationConfig, PRIORITY_MAP } from './types';

interface NotionPageResponse {
  id: string;
  url: string;
  object: string;
}

interface NotionErrorResponse {
  object: 'error';
  status: number;
  code: string;
  message: string;
}

export async function createNotionPage(
  ticket: TicketData,
  config: IntegrationConfig
): Promise<TicketResult> {
  if (!config.accessToken) {
    return {
      success: false,
      error: 'Notion access token not configured',
      platform: 'notion',
    };
  }

  if (!config.databaseId) {
    return {
      success: false,
      error: 'Notion database ID not configured',
      platform: 'notion',
    };
  }

  const apiUrl = 'https://api.notion.com/v1/pages';

  // Build content blocks
  const children = [
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: ticket.description } }],
      },
    },
  ];

  // Add source attribution
  if (ticket.source) {
    children.push({
      object: 'block',
      type: 'divider',
      divider: {},
    } as any);

    const sourceText = `Source: ${ticket.source.type}${ticket.source.author ? ` by ${ticket.source.author}` : ''}`;
    children.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { type: 'text', text: { content: sourceText } },
        ],
      },
    } as any);

    if (ticket.source.url) {
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: 'View original', link: { url: ticket.source.url } },
            },
          ],
        },
      } as any);
    }

    children.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: 'Created via Lark AI' },
          },
        ],
      },
    } as any);
  }

  // Build properties based on common Notion database schema
  const properties: Record<string, unknown> = {
    // Title is required
    Name: {
      title: [{ text: { content: ticket.title } }],
    },
  };

  // Add priority if the database has a Priority property
  if (ticket.priority) {
    properties.Priority = {
      select: { name: PRIORITY_MAP.notion[ticket.priority] },
    };
  }

  // Add status
  properties.Status = {
    select: { name: 'To Do' },
  };

  // Add tags/labels if specified
  if (ticket.labels && ticket.labels.length > 0) {
    properties.Tags = {
      multi_select: ticket.labels.map((label) => ({ name: label })),
    };
  }

  // Add source type
  if (ticket.source?.type) {
    properties.Source = {
      select: { name: ticket.source.type },
    };
  }

  const pageData = {
    parent: { database_id: config.databaseId },
    properties,
    children,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.accessToken}`,
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(pageData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as NotionErrorResponse;
      return {
        success: false,
        error: error.message || `Notion API error: ${response.status}`,
        platform: 'notion',
      };
    }

    const page = data as NotionPageResponse;

    return {
      success: true,
      ticketId: page.id.replace(/-/g, '').slice(0, 8), // Short ID
      ticketUrl: page.url,
      platform: 'notion',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      platform: 'notion',
    };
  }
}

// Fetch databases for configuration
export async function getNotionDatabases(accessToken: string) {
  const response = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: { property: 'object', value: 'database' },
      page_size: 100,
    }),
  });

  if (!response.ok) return [];

  const data = await response.json();
  return data.results || [];
}

// Get database schema to understand properties
export async function getNotionDatabaseSchema(accessToken: string, databaseId: string) {
  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': '2022-06-28',
    },
  });

  if (!response.ok) return null;

  return response.json();
}
