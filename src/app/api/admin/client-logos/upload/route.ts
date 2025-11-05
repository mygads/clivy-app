import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { uploadPaymentInstructionImage, deletePaymentInstructionImage } from "@/services/upload/upload";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// POST /api/admin/client-logos/upload - Upload client logo images
export async function POST(req: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(req);
    if (!adminAuth) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      ));
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return withCORS(NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      ));
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return withCORS(NextResponse.json(
        { success: false, error: "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed" },
        { status: 400 }
      ));
    }

    // Validate file size (max 2MB for logos)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return withCORS(NextResponse.json(
        { success: false, error: "File size too large. Maximum 2MB allowed" },
        { status: 400 }
      ));
    }

    try {
      // Use the existing upload service but for client logos
      const logoUrl = await uploadPaymentInstructionImage(file);

      return withCORS(NextResponse.json({
        success: true,
        data: {
          logoUrl
        },
        message: "Client logo uploaded successfully"
      }));

    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return withCORS(NextResponse.json(
        { success: false, error: "Failed to upload logo to blob storage" },
        { status: 500 }
      ));
    }

  } catch (error) {
    console.error("[CLIENT_LOGO_UPLOAD]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to upload client logo" },
      { status: 500 }
    ));
  }
}

// DELETE /api/admin/client-logos/upload - Delete client logo image from blob storage
export async function DELETE(req: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(req);
    if (!adminAuth) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      ));
    }

    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");
    
    if (!imageUrl) {
      return withCORS(NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      ));
    }

    // Check if it's a blob URL
    if (!imageUrl.includes('blob.vercel-storage.com')) {
      return withCORS(NextResponse.json(
        { success: false, error: "Only blob storage URLs can be deleted" },
        { status: 400 }
      ));
    }

    try {
      await deletePaymentInstructionImage(imageUrl);

      return withCORS(NextResponse.json({
        success: true,
        message: "Client logo deleted successfully"
      }));
    } catch (deleteError) {
      console.error('Failed to delete logo from blob storage:', deleteError);
      return withCORS(NextResponse.json(
        { success: false, error: "Failed to delete logo from blob storage" },
        { status: 500 }
      ));
    }

  } catch (error) {
    console.error("[CLIENT_LOGO_DELETE_UPLOAD]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to delete client logo" },
      { status: 500 }
    ));
  }
}