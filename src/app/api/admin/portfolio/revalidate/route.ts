import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { revalidatePortfolio } from "@/lib/portfolio-revalidation";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// POST /api/admin/portfolio/revalidate - Manual ISR revalidation (admin only)
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

    // Trigger manual revalidation
    const revalidationResult = revalidatePortfolio();
    
    return withCORS(NextResponse.json({
      success: true,
      message: "Portfolio cache revalidated successfully",
      data: revalidationResult,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error("[PORTFOLIO_REVALIDATE]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to revalidate portfolio cache" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}