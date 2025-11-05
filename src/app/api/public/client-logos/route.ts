import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// GET /api/public/client-logos - Get all active client logos (no authentication required)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch active client logos ordered by sortOrder
    const clientLogos = await prisma.clientLogo.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset,
      select: {
        id: true,
        logoUrl: true,
        sortOrder: true,
        createdAt: true
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.clientLogo.count({ 
      where: { isActive: true } 
    });

    // Transform data to match frontend interface
    const transformedLogos = clientLogos.map((logo: any, index: number) => ({
      name: `Client ${index + 1}`, // Generic name for display
      logo: logo.logoUrl
    }));

    const responseData = {
      success: true,
      data: transformedLogos,
      meta: {
        total: totalCount,
        limit,
        offset,
        timestamp: new Date().toISOString(),
        note: "Client logos data is now served via ISR (Incremental Static Regeneration) on the About page for better performance. This API endpoint is still available for legacy support."
      }
    };

    return withCORS(NextResponse.json(responseData));
  } catch (error) {
    console.error("[CLIENT_LOGOS_PUBLIC_GET]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to fetch client logos data" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}