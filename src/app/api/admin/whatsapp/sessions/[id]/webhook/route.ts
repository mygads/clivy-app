import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const WHATSAPP_SERVER_API = process.env.WHATSAPP_SERVER_API;

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const webhookSchema = z.object({
  WebhookURL: z.string().url().optional().or(z.literal("")),
  Events: z.array(z.string()).optional(),
});

// POST /api/admin/whatsapp/sessions/[id]/webhook - Update webhook configuration
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const userAuth = await getAdminAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, message: "Admin authentication required. Please login first." },
        { status: 401 }
      ));
    }

    const { id: sessionId } = await params;
    const body = await request.json();
    const validation = webhookSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { WebhookURL, Events } = validation.data;

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

    // Call external WhatsApp service
    const response = await fetch(`${WHATSAPP_SERVER_API}/webhook`, {
      method: 'POST',
      headers: {
        'token': session.token, // Use session's own token
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: sessionId,
        WebhookURL: WebhookURL || '',
        Events: Events || ['All']
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ADMIN_WEBHOOK_POST] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[ADMIN_WEBHOOK_POST] External service returned error:`, data);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: data.details || 'WhatsApp service returned error' 
      }, { status: 500 }));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: data.data,
      message: "Webhook configuration updated successfully"
    }));

  } catch (error) {
    console.error("[ADMIN_WEBHOOK_POST]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to update webhook configuration" },
      { status: 500 }
    ));
  }
}

// DELETE /api/admin/whatsapp/sessions/[id]/webhook - Delete webhook configuration
export async function DELETE(request: Request, { params }: RouteParams) {
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

    // Call external WhatsApp service
    const response = await fetch(`${WHATSAPP_SERVER_API}/webhook`, {
      method: 'DELETE',
      headers: {
        'token': session.token, // Use session's own token
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: sessionId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ADMIN_WEBHOOK_DELETE] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[ADMIN_WEBHOOK_DELETE] External service returned error:`, data);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: data.details || 'WhatsApp service returned error' 
      }, { status: 500 }));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: data.data,
      message: "Webhook configuration deleted successfully"
    }));

  } catch (error) {
    console.error("[ADMIN_WEBHOOK_DELETE]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to delete webhook configuration" },
      { status: 500 }
    ));
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return corsOptionsResponse();
}
