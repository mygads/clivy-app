import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { put, del } from '@vercel/blob';
import { randomUUID } from 'crypto';

export async function OPTIONS() {
  return corsOptionsResponse();
}

// POST /api/admin/portfolio/upload - Upload portfolio images
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
    const files = formData.getAll("files") as File[];
    const uploadType = formData.get("type") as string; // "main" or "gallery"
    
    if (!files || files.length === 0) {
      return withCORS(NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      ));
    }

    if (!uploadType || !["main", "gallery"].includes(uploadType)) {
      return withCORS(NextResponse.json(
        { success: false, error: "Invalid upload type. Use 'main' or 'gallery'" },
        { status: 400 }
      ));
    }

    // Validate main image (only 1 file allowed)
    if (uploadType === "main" && files.length !== 1) {
      return withCORS(NextResponse.json(
        { success: false, error: "Main image upload requires exactly 1 file" },
        { status: 400 }
      ));
    }

    // Validate gallery images (max 10 files)
    if (uploadType === "gallery" && files.length > 10) {
      return withCORS(NextResponse.json(
        { success: false, error: "Gallery upload limited to maximum 10 files" },
        { status: 400 }
      ));
    }

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${i + 1}: Invalid file type. Only JPEG, PNG, and WebP are allowed`);
        continue;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        errors.push(`File ${i + 1}: File size too large. Maximum 5MB allowed`);
        continue;
      }

      try {
        // Generate unique filename
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `portfolio-${uploadType}/${randomUUID()}.${fileExtension}`;
        
        // Upload to Vercel Blob
        const blob = await put(fileName, file, {
          access: 'public',
        });

        uploadedUrls.push(blob.url);
      } catch (uploadError) {
        console.error(`Upload error for file ${i + 1}:`, uploadError);
        errors.push(`File ${i + 1}: Failed to upload to blob storage`);
      }
    }

    // Return results
    if (uploadedUrls.length === 0) {
      return withCORS(NextResponse.json(
        { 
          success: false, 
          error: "No files were uploaded successfully",
          errors 
        },
        { status: 400 }
      ));
    }

    const response: any = {
      success: true,
      data: {
        uploadType,
        urls: uploadedUrls,
        uploadedCount: uploadedUrls.length,
        totalFiles: files.length
      },
      message: `Successfully uploaded ${uploadedUrls.length} of ${files.length} files`
    };

    if (errors.length > 0) {
      response.warnings = errors;
    }

    return withCORS(NextResponse.json(response));

  } catch (error) {
    console.error("[PORTFOLIO_UPLOAD_IMAGE]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to upload images" },
      { status: 500 }
    ));
  }
}

// DELETE /api/admin/portfolio/upload - Delete portfolio image from blob storage
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
      // Extract the blob key from the URL
      const url = new URL(imageUrl);
      const pathname = url.pathname;
      // Remove leading slash to get the blob key
      const blobKey = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      
      if (blobKey) {
        await del(blobKey);
        console.log('Portfolio image deleted from blob storage:', blobKey);
      }

      return withCORS(NextResponse.json({
        success: true,
        message: "Image deleted successfully"
      }));
    } catch (deleteError) {
      console.error('Failed to delete image from blob storage:', deleteError);
      return withCORS(NextResponse.json(
        { success: false, error: "Failed to delete image from blob storage" },
        { status: 500 }
      ));
    }

  } catch (error) {
    console.error("[PORTFOLIO_DELETE_IMAGE]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    ));
  }
}