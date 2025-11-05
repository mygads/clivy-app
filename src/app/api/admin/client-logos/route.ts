import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// GET /api/admin/client-logos - Get all client logos (admin only)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Build where clause for filtering
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    // Fetch client logos
    const clientLogos = await prisma.clientLogo.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.clientLogo.count({ where });

    const responseData = {
      success: true,
      data: clientLogos,
      meta: {
        total: totalCount,
        limit,
        offset,
        includeInactive,
        timestamp: new Date().toISOString()
      }
    };

    return withCORS(NextResponse.json(responseData));
  } catch (error) {
    console.error("[CLIENT_LOGOS_ADMIN_GET]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to fetch client logos data" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}

// POST /api/admin/client-logos - Create new client logo (admin only)
export async function POST(request: NextRequest) {
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

    // If no sortOrder provided, get the next available order
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const maxOrder = await prisma.clientLogo.aggregate({
        _max: {
          sortOrder: true
        }
      });
      finalSortOrder = (maxOrder._max.sortOrder || 0) + 1;
    }

    // Create client logo
    const clientLogo = await prisma.clientLogo.create({
      data: {
        logoUrl,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: finalSortOrder
      }
    });

    return withCORS(NextResponse.json({
      success: true,
      data: clientLogo,
      message: "Client logo created successfully"
    }));
  } catch (error) {
    console.error("[CLIENT_LOGOS_ADMIN_POST]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to create client logo" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}