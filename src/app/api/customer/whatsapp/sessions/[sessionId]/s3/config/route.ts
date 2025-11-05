import { NextResponse } from "next/server";
import { getCustomerAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const WHATSAPP_SERVER_API = process.env.WHATSAPP_SERVER_API;

interface RouteParams {
  params: Promise<{
    sessionId: string;
  }>;
}

const s3Schema = z.object({
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

// POST /api/customer/whatsapp/sessions/[sessionId]/s3/config - Update S3 configuration
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      ));
    }

    const { sessionId } = await params;
    const body = await request.json();
    const validation = s3Schema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { 
      enabled, 
      endpoint, 
      region, 
      bucket, 
      access_key, 
      secret_key, 
      path_style, 
      public_url, 
      media_delivery, 
      retention_days 
    } = validation.data;

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
        media_delivery: media_delivery || 'base64',
        retention_days: retention_days !== undefined ? retention_days : 30
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[S3_CONFIG_POST] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[S3_CONFIG_POST] External service returned error:`, data);
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
    console.error("[S3_CONFIG_POST]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to update S3 configuration" },
      { status: 500 }
    ));
  }
}

// DELETE /api/customer/whatsapp/sessions/[sessionId]/s3/config - Delete S3 configuration
export async function DELETE(request: Request, { params }: RouteParams) {
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

    // Call external WhatsApp service to disable S3
    const response = await fetch(`${WHATSAPP_SERVER_API}/session/s3/config`, {
      method: 'POST',
      headers: {
        'token': session.token, // Use session's own token
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
        media_delivery: 'base64',
        retention_days: 30
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[S3_CONFIG_DELETE] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${response.status}` 
      }, { status: 500 }));
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error(`[S3_CONFIG_DELETE] External service returned error:`, data);
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
    console.error("[S3_CONFIG_DELETE]", error);
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
