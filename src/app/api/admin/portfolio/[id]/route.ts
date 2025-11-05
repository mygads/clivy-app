import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { revalidatePortfolio } from "@/lib/portfolio-revalidation";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// GET /api/admin/portfolio/[id] - Get single portfolio item (admin only)
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
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

    const portfolioItem = await prisma.portfolio.findUnique({
      where: { id }
    });

    if (!portfolioItem) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Portfolio item not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: portfolioItem
    }));
  } catch (error) {
    console.error("[PORTFOLIO_ADMIN_GET_SINGLE]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to fetch portfolio item" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}

// PUT /api/admin/portfolio/[id] - Update portfolio item (admin only)
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
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

    // Check if portfolio item exists
    const existingItem = await prisma.portfolio.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Portfolio item not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }));
    }

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

    // Update portfolio item
    const portfolioItem = await prisma.portfolio.update({
      where: { id },
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

    // Revalidate ISR cache after updating portfolio item
    const revalidationResult = revalidatePortfolio();
    console.log('[PORTFOLIO_UPDATE] ISR revalidation:', revalidationResult);

    return withCORS(NextResponse.json({
      success: true,
      data: portfolioItem,
      message: "Portfolio item updated successfully",
      revalidation: revalidationResult
    }));
  } catch (error) {
    console.error("[PORTFOLIO_ADMIN_PUT]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to update portfolio item" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}

// DELETE /api/admin/portfolio/[id] - Delete portfolio item (admin only)
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
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

    // Check if portfolio item exists
    const existingItem = await prisma.portfolio.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return withCORS(new NextResponse(JSON.stringify({
        success: false,
        error: "Portfolio item not found"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }));
    }

    // Delete portfolio item
    await prisma.portfolio.delete({
      where: { id }
    });

    // Revalidate ISR cache after deleting portfolio item
    const revalidationResult = revalidatePortfolio();
    console.log('[PORTFOLIO_DELETE] ISR revalidation:', revalidationResult);

    return withCORS(NextResponse.json({
      success: true,
      message: "Portfolio item deleted successfully",
      revalidation: revalidationResult
    }));
  } catch (error) {
    console.error("[PORTFOLIO_ADMIN_DELETE]", error);
    return withCORS(new NextResponse(JSON.stringify({ 
      success: false, 
      error: "Failed to delete portfolio item" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }));
  }
}