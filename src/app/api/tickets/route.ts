// Unified Ticket Creation API
// POST /api/tickets - Create a ticket on any connected platform

import { createTicket, TicketData, IntegrationConfig, IntegrationPlatform } from '@/lib/integrations';

export const runtime = 'edge';

interface CreateTicketRequest {
  platform: IntegrationPlatform;
  ticket: TicketData;
  config: IntegrationConfig;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as CreateTicketRequest;

    const { platform, ticket, config } = body;

    // Validate required fields
    if (!platform) {
      return Response.json(
        { success: false, error: 'Platform is required' },
        { status: 400 }
      );
    }

    if (!ticket?.title) {
      return Response.json(
        { success: false, error: 'Ticket title is required' },
        { status: 400 }
      );
    }

    if (!config?.accessToken && !config?.apiKey) {
      return Response.json(
        { success: false, error: 'Integration credentials required' },
        { status: 400 }
      );
    }

    // Create the ticket
    const result = await createTicket(platform, ticket, {
      ...config,
      platform,
    });

    if (!result.success) {
      return Response.json(result, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Ticket creation error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create ticket',
      },
      { status: 500 }
    );
  }
}

// GET /api/tickets - Get integration status (for dashboard)
export async function GET() {
  // In a real app, this would check stored integration configs
  // For now, return empty state
  return Response.json({
    integrations: {
      linear: { connected: false },
      github: { connected: false },
      jira: { connected: false },
      notion: { connected: false },
    },
  });
}
