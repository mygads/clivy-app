import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getAdminAuth } from "@/lib/auth-helpers";
import { z } from "zod";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// Validation schema for payment method update
const updatePaymentMethodSchema = z.object({
  name: z.string().min(1, "Display name is required").optional(),
  description: z.string().optional(),
  currency: z.enum(['idr', 'any']).optional().nullable().transform(val => val === null ? undefined : val),
  isActive: z.boolean().optional(),
  feeType: z.enum(['fixed', 'percentage']).optional(),
  feeValue: z.number().min(0).optional(),
  minFee: z.number().min(0).nullable().optional(),
  maxFee: z.number().min(0).nullable().optional(),
  bankDetailId: z.string().nullable().optional().transform(val => val === 'none' ? null : val),
  paymentInstructions: z.string().optional(),
  instructionType: z.enum(['text', 'image', 'both']).optional(),
  instructionImageUrl: z.string().optional(),
  requiresManualApproval: z.boolean().optional()
});

// GET /api/admin/payment-methods/[id] - Get single payment method
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 }));
    }

    const { id } = await params;

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        bankDetail: true
      }
    });

    if (!paymentMethod) {
      return withCORS(NextResponse.json(
        { success: false, error: "Payment method not found" },
        { status: 404 }
      ));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: paymentMethod
    }));
  } catch (error) {
    console.error("[PAYMENT_METHOD_GET]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch payment method" },
      { status: 500 }
    ));
  }
}

// PUT /api/admin/payment-methods/[id] - Update payment method
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 }));
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updatePaymentMethodSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    // Check if payment method exists
    const existingMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    });

    if (!existingMethod) {
      return withCORS(NextResponse.json(
        { success: false, error: "Payment method not found" },
        { status: 404 }
      ));
    }

    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: validation.data,
      include: {
        bankDetail: true
      }
    });

    return withCORS(NextResponse.json({
      success: true,
      data: updatedPaymentMethod,
      message: "Payment method updated successfully"
    }));
  } catch (error) {
    console.error("[PAYMENT_METHOD_PUT]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to update payment method" },
      { status: 500 }
    ));
  }
}

// PATCH /api/admin/payment-methods/[id] - Toggle payment method status or partial update
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 }));
    }

    const { id } = await params;
    const body = await request.json();

    // For toggle operations, we only accept isActive field
    const allowedFields = ['isActive'];
    const updateData: any = {};

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return withCORS(NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      ));
    }

    // Check if payment method exists
    const existingMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    });

    if (!existingMethod) {
      return withCORS(NextResponse.json(
        { success: false, error: "Payment method not found" },
        { status: 404 }
      ));
    }

    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: updateData,
      include: {
        bankDetail: true
      }
    });

    return withCORS(NextResponse.json({
      success: true,
      data: updatedPaymentMethod,
      message: "Payment method updated successfully"
    }));
  } catch (error) {
    console.error("[PAYMENT_METHOD_PATCH]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to update payment method" },
      { status: 500 }
    ));
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 }));
    }

    const { id } = await params;

    // Check if payment method exists
    const existingMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    });

    if (!existingMethod) {
      return withCORS(NextResponse.json(
        { success: false, error: "Payment method not found" },
        { status: 404 }
      ));
    }

    // Don't allow deleting system-generated methods
    if (existingMethod.isSystem) {
      return withCORS(NextResponse.json(
        { success: false, error: "Cannot delete system-generated payment methods. Please deactivate the related bank detail instead." },
        { status: 400 }
      ));
    }

    // Don't allow deleting any active payment methods (regardless of fee configuration)
    if (existingMethod.isActive) {
      const methodType = existingMethod.isGatewayMethod ? 'Duitku payment method' : 'payment method'
      return withCORS(NextResponse.json(
        { success: false, error: `Cannot delete active ${methodType}. Please deactivate it first.` },
        { status: 400 }
      ));
    }

    await prisma.paymentMethod.delete({
      where: { id }
    });

    return withCORS(NextResponse.json({
      success: true,
      message: "Payment method deleted successfully"
    }));
  } catch (error) {
    console.error("[PAYMENT_METHOD_DELETE]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to delete payment method" },
      { status: 500 }
    ));
  }
}
