import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth } from "@/lib/auth-helpers";
import { hasActiveWhatsAppSubscription } from "@/lib/whatsapp-subscription";
import { z } from "zod";

const WHATSAPP_SERVER_API = process.env.WHATSAPP_SERVER_API;
const WHATSAPP_ADMIN_TOKEN = process.env.WHATSAPP_ADMIN_TOKEN;

const updateSessionSchema = z.object({
  sessionName: z.string().min(1).max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// GET /api/customer/whatsapp/sessions/[sessionId] - Get specific session details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      ));
    }

    // Check if user has active WhatsApp subscription
    const hasSubscription = await hasActiveWhatsAppSubscription(userAuth.id);
    if (!hasSubscription) {
      return withCORS(NextResponse.json(
        { success: false, message: "Active WhatsApp subscription required" },
        { status: 403 }
      ));
    }

    // Check if session exists and belongs to user - support both sessionId and sessionName
    const session = await prisma.whatsAppSession.findFirst({
      where: {
        userId: userAuth.id,
        OR: [
          { id: sessionId },
          { sessionId: sessionId },
          { sessionName: sessionId }
        ]
      },
      select: {
        id: true,
        sessionId: true,
        sessionName: true,
        token: true,
        status: true,
        connected: true,
        loggedIn: true,
        jid: true,
        qrcode: true,
        message: true,
        webhook: true,
        events: true,
        createdAt: true,
        updatedAt: true,
        isSystemSession: true,
        proxyEnabled: true,
        proxyUrl: true,
        s3Enabled: true,
        s3Endpoint: true,
        s3Region: true,
        s3Bucket: true,
        s3AccessKey: true,
        s3PathStyle: true,
        s3PublicUrl: true,
        s3MediaDelivery: true,
        s3RetentionDays: true,
      },
    });

    if (!session) {
      return withCORS(NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      ));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: session,
    }));
  } catch (error) {
    console.error("[CUSTOMER_WHATSAPP_SESSION_GET]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch WhatsApp session" },
      { status: 500 }
    ));
  }
}

// PUT /api/customer/whatsapp/sessions/[sessionId] - Update session (activate/deactivate, rename)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      ));
    }

    // Check if user has active WhatsApp subscription
    const hasSubscription = await hasActiveWhatsAppSubscription(userAuth.id);
    if (!hasSubscription) {
      return withCORS(NextResponse.json(
        { success: false, message: "Active WhatsApp subscription required" },
        { status: 403 }
      ));
    }

    const body = await request.json();
    const validation = updateSessionSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    // Check if session exists and belongs to user - support both sessionId and sessionName
    const existingSession = await prisma.whatsAppSession.findFirst({
      where: {
        userId: userAuth.id,
        OR: [
          { id: sessionId },
          { sessionId: sessionId },
          { sessionName: sessionId }
        ]
      },
    });

    if (!existingSession) {
      return withCORS(NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      ));
    }

    const updateData: any = {};
    
    if (validation.data.sessionName) {
      updateData.sessionName = validation.data.sessionName;
    }
    
    if (validation.data.status) {
      updateData.status = validation.data.status === 'active' ? 'connected' : 'disconnected';
    }

    const updatedSession = await prisma.whatsAppSession.update({
      where: { id: existingSession.id },
      data: updateData,
      select: {
        id: true,
        sessionId: true,
        sessionName: true,
        token: true,
        status: true,
        connected: true,
        loggedIn: true,
        jid: true,
        qrcode: true,
        message: true,
        webhook: true,
        events: true,
        createdAt: true,
        updatedAt: true,
        isSystemSession: true,
        proxyEnabled: true,
        proxyUrl: true,
        s3Enabled: true,
        s3Endpoint: true,
        s3Region: true,
        s3Bucket: true,
        s3AccessKey: true,
        s3PathStyle: true,
        s3PublicUrl: true,
        s3MediaDelivery: true,
        s3RetentionDays: true,
      },
    });

    return withCORS(NextResponse.json({
      success: true,
      data: updatedSession,
      message: "Session updated successfully",
    }));
  } catch (error) {
    console.error("[CUSTOMER_WHATSAPP_SESSION_PUT]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to update WhatsApp session" },
      { status: 500 }
    ));
  }
}

// DELETE /api/customer/whatsapp/sessions/[sessionId] - Delete session
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      ));
    }

    // Check if user has active WhatsApp subscription
    const hasSubscription = await hasActiveWhatsAppSubscription(userAuth.id);
    if (!hasSubscription) {
      return withCORS(NextResponse.json(
        { success: false, message: "Active WhatsApp subscription required" },
        { status: 403 }
      ));
    }

    // Check if session exists and belongs to user - support both sessionId and sessionName
    const existingSession = await prisma.whatsAppSession.findFirst({
      where: {
        userId: userAuth.id,
        OR: [
          { id: sessionId },
          { sessionId: sessionId },
          { sessionName: sessionId }
        ]
      },
    });

    if (!existingSession) {
      return withCORS(NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      ));
    }

    // Delete session from external WhatsApp Go service first
    if (WHATSAPP_SERVER_API && WHATSAPP_ADMIN_TOKEN) {
      try {
        console.log(`[WHATSAPP_SESSION_DELETE] Deleting session from external service: ${existingSession.token}`);
        
        const externalResponse = await fetch(`${WHATSAPP_SERVER_API}/admin/users/${existingSession.token}`, {
          method: 'DELETE',
          headers: {
            'Authorization': WHATSAPP_ADMIN_TOKEN,
            'Content-Type': 'application/json'
          }
        });

        if (!externalResponse.ok) {
          const errorData = await externalResponse.json().catch(() => ({}));
          console.error(`[WHATSAPP_SESSION_DELETE] External service error:`, errorData);
          // Continue with database deletion even if external service fails
        } else {
          console.log(`[WHATSAPP_SESSION_DELETE] Successfully deleted session from external service`);
        }
      } catch (error) {
        console.error(`[WHATSAPP_SESSION_DELETE] Failed to delete from external service:`, error);
        // Continue with database deletion even if external service fails
      }
    }

    // Delete the session from database
    await prisma.whatsAppSession.delete({
      where: { id: existingSession.id },
    });

    return withCORS(NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    }));
  } catch (error) {
    console.error("[CUSTOMER_WHATSAPP_SESSION_DELETE]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to delete WhatsApp session" },
      { status: 500 }
    ));
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return corsOptionsResponse();
}
