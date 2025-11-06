import { NextRequest, NextResponse } from "next/server";
import { withCORS, corsOptionsResponse } from "@/lib/cors";

/**
 * DEPRECATED: Addon system has been removed
 * This endpoint is kept for backwards compatibility but returns empty data
 * Only WhatsApp packages are supported now
 */

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function GET(request: NextRequest) {
  console.warn('[DEPRECATED] /api/customer/my-addons - Addon system removed');
  
  return withCORS(NextResponse.json({
    success: true,
    data: [],
    stats: {
      total: 0,
      complete: 0,
      pending: 0,
      inprogress: 0
    },
    message: 'Addon system has been removed. Please use WhatsApp packages instead.'
  }));
}
