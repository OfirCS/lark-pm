import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware - auth is handled client-side by AuthProvider
// This just ensures API routes and static assets pass through
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
};
