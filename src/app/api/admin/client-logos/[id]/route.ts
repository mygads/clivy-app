import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// GET /api/admin/client-logos/[id] - Get specific client logo (admin only)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check admin authentication
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Admin authentication required"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }));
    }

    const clientLogo = await prisma.clientLogo.findUnique({
      where: {
        id: params.id
      }
    });

    if (!clientLogo) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Client logo not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: clientLogo
    }));
  } catch (error) {
    console.error("[CLIENT_LOGO_GET]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to fetch client logo" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}

// PUT /api/admin/client-logos/[id] - Update client logo (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check admin authentication
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Admin authentication required"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }));
    }

    const body = await request.json();
    const { logoUrl, isActive, sortOrder } = body;

    // Validate required fields
    if (!logoUrl) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Logo URL is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    }

    // Check if client logo exists
    const existingClientLogo = await prisma.clientLogo.findUnique({
      where: { id: params.id }
    });

    if (!existingClientLogo) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Client logo not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }));
    }

    // Update client logo
    const updatedClientLogo = await prisma.clientLogo.update({
      where: { id: params.id },
      data: {
        logoUrl,
        isActive: isActive !== undefined ? isActive : existingClientLogo.isActive,
        sortOrder: sortOrder !== undefined ? sortOrder : existingClientLogo.sortOrder
      }
    });

    return withCORS(NextResponse.json({
      success: true,
      data: updatedClientLogo,
      message: "Client logo updated successfully"
    }));
  } catch (error) {
    console.error("[CLIENT_LOGO_UPDATE]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to update client logo" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}

// DELETE /api/admin/client-logos/[id] - Delete client logo (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check admin authentication
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Admin authentication required"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }));
    }

    // Check if client logo exists
    const existingClientLogo = await prisma.clientLogo.findUnique({
      where: { id: params.id }
    });

    if (!existingClientLogo) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Client logo not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }));
    }

    // Delete from blob storage if it's a blob URL
    if (existingClientLogo.logoUrl && existingClientLogo.logoUrl.includes('blob.vercel-storage.com')) {
      try {
        const { del } = await import('@vercel/blob');
        const url = new URL(existingClientLogo.logoUrl);
        const pathname = url.pathname;
        const blobKey = pathname.startsWith('/') ? pathname.slice(1) : pathname;
        
        if (blobKey) {
          await del(blobKey);
          console.log('Client logo deleted from blob storage:', blobKey);
        }
      } catch (deleteError) {
        console.warn('Failed to delete client logo from blob storage:', deleteError);
      }
    }

    // Delete client logo from database
    await prisma.clientLogo.delete({
      where: { id: params.id }
    });

    return withCORS(NextResponse.json({
      success: true,
      message: "Client logo deleted successfully"
    }));
  } catch (error) {
    console.error("[CLIENT_LOGO_DELETE]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to delete client logo" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}