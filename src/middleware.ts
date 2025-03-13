import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware helps with routing in Azure Static Web Apps
export function middleware(request: NextRequest) {
  // Clean up query parameters that might interfere with routing
  if (request.nextUrl.searchParams.has('code')) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('code');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, manifest.json (public files)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|manifest.json).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}; 