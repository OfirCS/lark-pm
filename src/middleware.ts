// Middleware for authentication
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add custom logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes that don't require auth
        const publicPaths = [
          '/',
          '/login',
          '/signup',
          '/api/auth',
          '/brand',
          '/api/cron',
          '/api/integrations/slack/webhook',
        ];

        // Check if path is public
        const isPublicPath = publicPaths.some(
          (path) => pathname === path || pathname.startsWith(`${path}/`)
        );

        if (isPublicPath) {
          return true;
        }

        // Protected routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
};
