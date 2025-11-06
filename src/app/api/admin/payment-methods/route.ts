import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getAdminAuth } from "@/lib/auth-helpers";
import { z } from "zod";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// Validation schema for payment method (IDR only, no currency field)
const paymentMethodSchema = z.object({
  code: z.string().min(1, "Payment method code is required"),
  name: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  type: z.enum(['manual_transfer', 'bank_transfer', 'digital_wallet', 'credit_card', 'crypto', 'other'], {
    required_error: "Type is required",
    invalid_type_error: "Type must be one of: manual_transfer, bank_transfer, digital_wallet, credit_card, crypto, other"
  }),
  isActive: z.boolean().default(true),
  isGatewayMethod: z.boolean().default(false),
  feeType: z.enum(['fixed', 'percentage']).optional(),
  feeValue: z.number().min(0).optional(),
  minFee: z.number().min(0).nullable().optional(),
  maxFee: z.number().min(0).nullable().optional(),
  bankDetailId: z.string().nullable().optional().transform(val => val === 'none' ? null : val),
  paymentInstructions: z.string().optional(),
  instructionType: z.enum(['text', 'image', 'both']).optional(),
  instructionImageUrl: z.string().optional(),
  requiresManualApproval: z.boolean().default(false)
});

// GET /api/admin/payment-methods - Get all payment methods
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 }));
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const isActive = url.searchParams.get('isActive');
    const includeSystemGenerated = url.searchParams.get('includeSystemGenerated') === 'true';

    const where: any = {};
    if (type) where.type = type;
    if (isActive !== null) where.isActive = isActive === 'true';
    // Show all payment methods by default (both system and manual)

    const paymentMethods = await prisma.paymentMethod.findMany({
      where,
      include: {
        bankDetail: true
      },
      orderBy: [
        { isSystem: 'asc' }, // Manual methods first
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    return withCORS(NextResponse.json({
      success: true,
      data: paymentMethods,
      total: paymentMethods.length
    }));
  } catch (error) {
    console.error("[PAYMENT_METHODS_GET]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch payment methods" },
      { status: 500 }
    ));
  }
}

// POST /api/admin/payment-methods - Create new payment method
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 }));
    }

    const body = await request.json();
    const validation = paymentMethodSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { code, name, description, type, isActive, isGatewayMethod, feeType, feeValue, minFee, maxFee, bankDetailId, paymentInstructions, instructionType, instructionImageUrl, requiresManualApproval } = validation.data;

    // Check if code already exists
    const existingMethod = await prisma.paymentMethod.findUnique({
      where: { code }
    });

    if (existingMethod) {
      return withCORS(NextResponse.json(
        { success: false, error: `Payment method with code '${code}' already exists` },
        { status: 409 }
      ));
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        code,
        name,
        description,
        type,
        isActive,
        isSystem: false, // Manual payment methods created by admin
        isGatewayMethod,
        feeType,
        feeValue,
        minFee,
        maxFee,
        bankDetailId,
        paymentInstructions,
        instructionType,
        instructionImageUrl,
        requiresManualApproval
      },
      include: {
        bankDetail: true
      }
    });

    return withCORS(NextResponse.json({
      success: true,
      data: paymentMethod,
      message: "Payment method created successfully"
    }));
  } catch (error) {
    console.error("[PAYMENT_METHODS_POST]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to create payment method" },
      { status: 500 }
    ));
  }
}
