import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// GET /api/public/portfolio - Get all active portfolio items (no authentication required)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const category = searchParams.get("category");

    // Build where clause for filtering
    const where: any = {
      isActive: true
    };

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
      skip: offset,
      select: {
        id: true,
        title: true,
        image: true,
        gallery: true,
        tech: true,
        category: true,
        description: true,
        link: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.portfolio.count({ where });

    // Transform data to match frontend interface
    const transformedItems = portfolioItems.map(item => ({
      id: parseInt(item.id), // Convert string ID to number for frontend compatibility
      title: item.title,
      image: item.image,
      gallery: item.gallery.length > 0 ? item.gallery : undefined,
      tech: item.tech.length > 0 ? item.tech : undefined,
      category: item.category || undefined,
      description: item.description || undefined,
      link: item.link || undefined
    }));

    const responseData = {
      success: true,
      data: transformedItems,
      meta: {
        total: totalCount,
        limit,
        offset,
        category: category || null,
        timestamp: new Date().toISOString(),
        note: "Portfolio data is now served via ISR (Incremental Static Regeneration) on the About page for better performance. This API endpoint is still available for legacy support."
      }
    };

    return withCORS(NextResponse.json(responseData));
  } catch (error) {
    console.error("[PORTFOLIO_PUBLIC_GET]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to fetch portfolio data" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}