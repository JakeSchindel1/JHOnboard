// This file is no longer needed since we're not using static export anymore
// The real API route at route.ts will handle requests
// You can delete this file

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return new NextResponse(
    JSON.stringify({
      success: false,
      message: "This is a static stub that should be deleted. Use route.ts instead.",
      error: "This application is now using standard Next.js deployment which supports API routes",
      solution: "The app will use the API routes in route.ts"
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
} 