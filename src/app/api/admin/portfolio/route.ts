import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { revalidatePortfolio } from "@/lib/portfolio-revalidation";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// GET /api/admin/portfolio - Get all portfolio items (admin only)
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
    const category = searchParams.get("category");
    const includeInactive = searchParams.get("includeInactive") === "true";

    // Build where clause for filtering
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (category) {
      where.category = category;
    }

    // Fetch portfolio items
    const portfolioItems = await prisma.portfolio.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.portfolio.count({ where });

    const responseData = {
      success: true,
      data: portfolioItems,
      meta: {
        total: totalCount,
        limit,
        offset,
        category: category || null,
        includeInactive,
        timestamp: new Date().toISOString()
      }
    };

    return withCORS(NextResponse.json(responseData));
  } catch (error) {
    console.error("[PORTFOLIO_ADMIN_GET]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to fetch portfolio data" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}

// POST /api/admin/portfolio - Create new portfolio item (admin only)
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
    const { title, image, gallery, tech, category, description, link, isActive } = body;

    // Validate required fields
    if (!title || !image) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Title and image are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    }

    // Create portfolio item
    const portfolioItem = await prisma.portfolio.create({
      data: {
        title,
        image,
        gallery: gallery || [],
        tech: tech || [],
        category: category || null,
        description: description || null,
        link: link || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    // Revalidate ISR cache after creating portfolio item
    const revalidationResult = revalidatePortfolio();
    console.log('[PORTFOLIO_CREATE] ISR revalidation:', revalidationResult);

    return withCORS(NextResponse.json({
      success: true,
      data: portfolioItem,
      message: "Portfolio item created successfully",
      revalidation: revalidationResult
    }));
  } catch (error) {
    console.error("[PORTFOLIO_ADMIN_POST]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to create portfolio item" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}