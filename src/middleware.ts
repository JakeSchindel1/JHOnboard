import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware for static export - handles authentication redirects
export function middleware(request: NextRequest) {
  // For static export, we only handle specific cases like auth redirect cleanup
  const url = request.nextUrl.clone();
  
  // Handle auth redirects which might have query parameters
  if (url.pathname === '/' && url.searchParams.has('code')) {
    url.searchParams.delete('code');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Simplified matcher for static export
export const config = {
  matcher: ['/', '/onboarding', '/reset-password', '/success']
}; 