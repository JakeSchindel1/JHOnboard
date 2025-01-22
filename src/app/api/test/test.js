// src/app/api/test/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ message: "API is working!" });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}