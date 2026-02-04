// Slack Integration
// OAuth and API helpers for Slack

export interface SlackOAuthResponse {
  ok: boolean;
  access_token?: string;
  token_type?: string;
  scope?: string;
  bot_user_id?: string;
  app_id?: string;
  team?: {
    id: string;
    name: string;
  };
  authed_user?: {
    id: string;
  };
  error?: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
}

// Exchange OAuth code for access token
export async function exchangeSlackCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<SlackOAuthResponse> {
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  return response.json();
}

// Get list of channels the bot can access
export async function getSlackChannels(accessToken: string): Promise<SlackChannel[]> {
  const response = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || 'Failed to get channels');
  }

  return data.channels || [];
}

// Post a message to a channel
export async function postSlackMessage(
  accessToken: string,
  channel: string,
  text: string,
  blocks?: unknown[]
): Promise<boolean> {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      channel,
      text,
      blocks,
    }),
  });

  const data = await response.json();
  return data.ok;
}

// Add reaction to a message
export async function addSlackReaction(
  accessToken: string,
  channel: string,
  timestamp: string,
  reaction: string
): Promise<boolean> {
  const response = await fetch('https://slack.com/api/reactions.add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      channel,
      timestamp,
      name: reaction, // e.g., 'eyes', 'white_check_mark'
    }),
  });

  const data = await response.json();
  return data.ok;
}

// Get user info
export async function getSlackUser(
  accessToken: string,
  userId: string
): Promise<{ name: string; email?: string; avatar?: string } | null> {
  const response = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!data.ok) return null;

  return {
    name: data.user?.real_name || data.user?.name || userId,
    email: data.user?.profile?.email,
    avatar: data.user?.profile?.image_72,
  };
}

// Generate Slack OAuth URL
export function getSlackOAuthUrl(
  clientId: string,
  redirectUri: string,
  state?: string
): string {
  const scopes = [
    'channels:history',
    'channels:read',
    'chat:write',
    'reactions:write',
    'users:read',
    'users:read.email',
  ].join(',');

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
  });

  if (state) {
    params.set('state', state);
  }

  return `https://slack.com/oauth/v2/authorize?${params}`;
}
