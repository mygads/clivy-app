import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS } from "@/lib/cors";
import { getCustomerAuth } from "@/lib/auth-helpers";
import { hasActiveWhatsAppSubscription } from "@/lib/whatsapp-subscription";

const WHATSAPP_SERVER_API = process.env.WHATSAPP_SERVER_API;

// GET /api/customer/whatsapp/sessions/[sessionId]/status - Get session status from WhatsApp server
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

    if (!WHATSAPP_SERVER_API) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: 'WhatsApp service configuration missing' 
      }, { status: 500 }));
    }

    // Check if session exists and belongs to user - support id, sessionId, and sessionName
    const session = await prisma.whatsAppSession.findFirst({
      where: {
        userId: userAuth.id,
        OR: [
          { id: sessionId },
          { sessionId: sessionId },
          { sessionName: sessionId }
        ]
      }
    });

    if (!session) {
      return withCORS(NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      ));
    }

    // Make request to external WhatsApp Go service
    const response = await fetch(`${WHATSAPP_SERVER_API}/session/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': session.token // Use session token for authentication
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      return withCORS(NextResponse.json({
        success: false,
        error: responseData.error || "Failed to get session status",
        code: response.status
      }, { status: response.status }));
    }

    // Update session status in database based on external service response
    let updatedSession = session;
    if (responseData.success && responseData.data) {
      updatedSession = await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: {
          connected: responseData.data.connected || false,
          loggedIn: responseData.data.loggedIn || false,
          jid: responseData.data.jid || null,
          qrcode: responseData.data.qrcode || null,
          events: responseData.data.events || session.events,
          updatedAt: new Date()
        }
      });
    }

    return withCORS(NextResponse.json({
      success: true,
      code: 200,
      data: {
        connected: updatedSession.connected,
        events: updatedSession.events || "All",
        id: updatedSession.sessionId,
        jid: updatedSession.jid || "",
        loggedIn: updatedSession.loggedIn,
        name: updatedSession.sessionName,
        proxy_config: {
          enabled: updatedSession.proxyEnabled || false,
          proxy_url: updatedSession.proxyUrl || ""
        },
        proxy_url: updatedSession.proxyUrl || "",
        qrcode: updatedSession.qrcode || "",
        s3_config: {
          access_key: updatedSession.s3AccessKey ? "***" : "",
          bucket: updatedSession.s3Bucket || "",
          enabled: updatedSession.s3Enabled || false,
          endpoint: updatedSession.s3Endpoint || "",
          media_delivery: updatedSession.s3MediaDelivery || "base64",
          path_style: updatedSession.s3PathStyle || false,
          public_url: updatedSession.s3PublicUrl || "",
          region: updatedSession.s3Region || "",
          retention_days: updatedSession.s3RetentionDays || 30
        },
        token: updatedSession.token,
        webhook: updatedSession.webhook || ""
      }
    }));

  } catch (error) {
    console.error("[WHATSAPP_SESSION_STATUS]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to get WhatsApp session status" },
      { status: 500 }
    ));
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
