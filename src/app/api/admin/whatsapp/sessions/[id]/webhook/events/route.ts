import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

const WHATSAPP_SERVER_API = process.env.WHATSAPP_SERVER_API;

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/admin/whatsapp/sessions/[sessionId]/webhook/events - Get available webhook events
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const userAuth = await getAdminAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, message: "Admin authentication required. Please login first." },
        { status: 401 }
      ));
    }

    const { id: sessionId } = await params;

    if (!WHATSAPP_SERVER_API) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: 'WhatsApp service configuration missing' 
      }, { status: 500 }));
    }

    // Get session from database to get the session token
    const session = await prisma.whatsAppSession.findUnique({
      where: { sessionId: sessionId }
    });

    if (!session) {
      return withCORS(NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 }));
    }

    // Call external WhatsApp service to get available events (admin gets general events, not session-specific)
    const response = await fetch(`${WHATSAPP_SERVER_API}/webhook/events?session=${sessionId}`, {
      method: 'GET',
      headers: {
        'token': session.token, // Use session's own token
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ADMIN_WEBHOOK_EVENTS_GET] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[ADMIN_WEBHOOK_EVENTS_GET] External service returned error:`, data);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: data.details || 'WhatsApp service returned error' 
      }, { status: 500 }));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: data.data,
      message: "Webhook events retrieved successfully"
    }));

  } catch (error) {
    console.error("[ADMIN_WEBHOOK_EVENTS_GET]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to get webhook events" },
      { status: 500 }
    ));
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return corsOptionsResponse();
}
