import { getApiDocs } from '@/lib/swagger';
import { NextResponse } from 'next/server';
import { withCORS, corsOptionsResponse } from '@/lib/cors';

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function GET() {
  try {
    const spec = getApiDocs();
    
    return withCORS(NextResponse.json(spec));
  } catch (error) {
    console.error('Error generating API docs:', error);
    return withCORS(
      NextResponse.json(
        { error: 'Failed to generate API documentation' },
        { status: 500 }
      )
    );
  }
}
