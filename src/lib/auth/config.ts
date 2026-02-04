// NextAuth.js Configuration
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for auth operations
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // GitHub OAuth (can be used for both login AND integration)
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    // Email/Password (for demo/development)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
          // Demo mode - allow any login
          return {
            id: 'demo-user',
            email: credentials.email,
            name: credentials.email.split('@')[0],
          };
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data.user) {
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || data.user.email,
            image: data.user.user_metadata?.avatar_url,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const supabase = getSupabaseClient();
      if (!supabase) {
        // Demo mode - allow sign in without DB
        return true;
      }

      try {
        // Check if user exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (!existingUser) {
          // Create new user
          const { error: insertError } = await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.image,
          } as Record<string, unknown>);

          if (insertError) {
            console.error('User insert error:', insertError);
          }

          // Create default organization
          const slug = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: `${user.name || user.email}'s Workspace`,
              slug: `${slug}-${Date.now()}`,
              plan: 'free',
            } as Record<string, unknown>)
            .select()
            .single();

          if (orgError) {
            console.error('Org insert error:', orgError);
          }

          if (org) {
            // Add user as owner
            await supabase.from('organization_members').insert({
              organization_id: org.id,
              user_id: user.id,
              role: 'owner',
            } as Record<string, unknown>);
          }
        }

        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return true; // Allow sign in even if DB operations fail
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    newUser: '/onboarding',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken?: string;
    provider?: string;
  }
}
