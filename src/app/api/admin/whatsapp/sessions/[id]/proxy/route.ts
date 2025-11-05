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

const proxySchema = z.object({
  proxy_url: z.string().optional(),
  enable: z.boolean().optional(),
});

// POST /api/admin/whatsapp/sessions/[id]/proxy - Update proxy configuration
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const userAuth = await getAdminAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, message: "Admin authentication required. Please login first." },
        { status: 401 }
      ));
    }

    const { id: sessionId } = await params;
    const body = await request.json();
    const validation = proxySchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { proxy_url, enable } = validation.data;

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
    const response = await fetch(`${WHATSAPP_SERVER_API}/session/proxy`, {
      method: 'POST',
      headers: {
        'token': session.token, // Use session's own token
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: sessionId,
        proxy_url: proxy_url || '',
        enable: enable !== undefined ? enable : false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ADMIN_PROXY_POST] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[ADMIN_PROXY_POST] External service returned error:`, data);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: data.details || 'WhatsApp service returned error' 
      }, { status: 500 }));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: data.data,
      message: "Proxy configuration updated successfully"
    }));

  } catch (error) {
    console.error("[ADMIN_PROXY_POST]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to update proxy configuration" },
      { status: 500 }
    ));
  }
}

// DELETE /api/admin/whatsapp/sessions/[id]/proxy - Delete proxy configuration
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

    // Call external WhatsApp service (disable proxy by setting enable: false)
    const response = await fetch(`${WHATSAPP_SERVER_API}/session/proxy`, {
      method: 'POST',
      headers: {
        'token': session.token, // Use session's own token
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: sessionId,
        proxy_url: '',
        enable: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ADMIN_PROXY_DELETE] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[ADMIN_PROXY_DELETE] External service returned error:`, data);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: data.details || 'WhatsApp service returned error' 
      }, { status: 500 }));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: data.data,
      message: "Proxy configuration deleted successfully"
    }));

  } catch (error) {
    console.error("[ADMIN_PROXY_DELETE]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to delete proxy configuration" },
      { status: 500 }
    ));
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return corsOptionsResponse();
}
