import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/onboarding'];

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  
  // If the user is trying to access a protected route
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    // And they don't have a session
    if (!session) {
      // Redirect them to the login page
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // We can't directly use firebase-admin in edge middleware
    // So instead, we'll allow the client to handle auth checks
    return NextResponse.next();
  }
  
  // If the route is not protected, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ['/onboarding/:path*', '/login']
}; 