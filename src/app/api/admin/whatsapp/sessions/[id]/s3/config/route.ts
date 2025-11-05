import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const WHATSAPP_SERVER_API = process.env.WHATSAPP_SERVER_API;
const WHATSAPP_ADMIN_TOKEN = process.env.WHATSAPP_ADMIN_TOKEN;

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const s3ConfigSchema = z.object({
  enabled: z.boolean().optional(),
  endpoint: z.string().optional(),
  region: z.string().optional(),
  bucket: z.string().optional(),
  access_key: z.string().optional(),
  secret_key: z.string().optional(),
  path_style: z.boolean().optional(),
  public_url: z.string().optional(),
  media_delivery: z.string().optional(),
  retention_days: z.number().optional(),
});

// GET /api/admin/whatsapp/sessions/[id]/s3/config - Get S3 configuration
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

    // Call external WhatsApp service
    const response = await fetch(`${WHATSAPP_SERVER_API}/session/s3/config?session=${sessionId}`, {
      method: 'GET',
      headers: {
        'token': session.token, // Use session's own token
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ADMIN_S3_CONFIG_GET] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[ADMIN_S3_CONFIG_GET] External service returned error:`, data);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: data.details || 'WhatsApp service returned error' 
      }, { status: 500 }));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: data.data,
      message: "S3 configuration retrieved successfully"
    }));

  } catch (error) {
    console.error("[ADMIN_S3_CONFIG_GET]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to get S3 configuration" },
      { status: 500 }
    ));
  }
}

// POST /api/admin/whatsapp/sessions/[id]/s3/config - Update S3 configuration
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
    const validation = s3ConfigSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { enabled, endpoint, region, bucket, access_key, secret_key, path_style, public_url, media_delivery, retention_days } = validation.data;

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
    const response = await fetch(`${WHATSAPP_SERVER_API}/session/s3/config`, {
      method: 'POST',
      headers: {
        'token': session.token, // Use session's own token
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: sessionId,
        enabled: enabled !== undefined ? enabled : false,
        endpoint: endpoint || '',
        region: region || '',
        bucket: bucket || '',
        access_key: access_key || '',
        secret_key: secret_key || '',
        path_style: path_style !== undefined ? path_style : false,
        public_url: public_url || '',
        media_delivery: media_delivery || '',
        retention_days: retention_days || 0
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ADMIN_S3_CONFIG_POST] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[ADMIN_S3_CONFIG_POST] External service returned error:`, data);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: data.details || 'WhatsApp service returned error' 
      }, { status: 500 }));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: data.data,
      message: "S3 configuration updated successfully"
    }));

  } catch (error) {
    console.error("[ADMIN_S3_CONFIG_POST]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to update S3 configuration" },
      { status: 500 }
    ));
  }
}

// DELETE /api/admin/whatsapp/sessions/[id]/s3/config - Delete S3 configuration
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

    if (!WHATSAPP_SERVER_API || !WHATSAPP_ADMIN_TOKEN) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: 'WhatsApp service configuration missing' 
      }, { status: 500 }));
    }

    // Call external WhatsApp service (disable S3 by setting enabled: false and clearing config)
    const response = await fetch(`${WHATSAPP_SERVER_API}/session/s3/config`, {
      method: 'POST',
      headers: {
        'Authorization': WHATSAPP_ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: sessionId,
        enabled: false,
        endpoint: '',
        region: '',
        bucket: '',
        access_key: '',
        secret_key: '',
        path_style: false,
        public_url: '',
        media_delivery: '',
        retention_days: 0
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ADMIN_S3_CONFIG_DELETE] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[ADMIN_S3_CONFIG_DELETE] External service returned error:`, data);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: data.details || 'WhatsApp service returned error' 
      }, { status: 500 }));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: data.data,
      message: "S3 configuration deleted successfully"
    }));

  } catch (error) {
    console.error("[ADMIN_S3_CONFIG_DELETE]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to delete S3 configuration" },
      { status: 500 }
    ));
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return corsOptionsResponse();
}
