import { NextResponse } from "next/server";
import { getCustomerAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

const WHATSAPP_SERVER_API = process.env.WHATSAPP_SERVER_API;

interface RouteParams {
  params: Promise<{
    sessionId: string;
  }>;
}

// GET /api/customer/whatsapp/sessions/[sessionId]/webhook/events - Get available webhook events
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      ));
    }

    const { sessionId } = await params;

    if (!WHATSAPP_SERVER_API) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: 'WhatsApp service configuration missing' 
      }, { status: 500 }));
    }

    // Get session from database to get the session token
    const session = await prisma.whatsAppSession.findFirst({
      where: {
        sessionId: sessionId, // Use sessionId field, not id
        userId: userAuth.id // Ensure user owns this session
      }
    });

    if (!session) {
      return withCORS(NextResponse.json({
        success: false,
        error: 'Session not found or access denied'
      }, { status: 404 }));
    }

    // Use the session's token for external WhatsApp service call
    const response = await fetch(`${WHATSAPP_SERVER_API}/webhook/events?session=${sessionId}`, {
      method: 'GET',
      headers: {
        'token': session.token, // Use session's own token
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[WEBHOOK_EVENTS_GET] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[WEBHOOK_EVENTS_GET] External service returned error:`, data);
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
    console.error("[WEBHOOK_EVENTS_GET]", error);
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
