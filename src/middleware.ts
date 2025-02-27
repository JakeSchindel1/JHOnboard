import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';

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

    try {
      // Verify the session
      await auth.verifySessionCookie(session);
      // If it's valid, let them through
      return NextResponse.next();
    } catch (error) {
      // If the session is not valid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // If the route is not protected, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ['/onboarding/:path*', '/login']
}; 