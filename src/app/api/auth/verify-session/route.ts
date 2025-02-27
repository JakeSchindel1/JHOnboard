import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { session } = await request.json();
    
    if (!session) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Verify the session with Firebase Admin
    await auth.verifySessionCookie(session);
    
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
} 