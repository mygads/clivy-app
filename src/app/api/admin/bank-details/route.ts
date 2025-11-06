import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminAuth } from '@/lib/auth-helpers';
import { withCORS, corsOptionsResponse } from '@/lib/cors';
import { z } from 'zod';

// Validation schema for bank detail creation/update
const bankDetailSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  accountName: z.string().min(1, "Account name is required"),
  swiftCode: z.string().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/admin/bank-details - Get all bank details
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      ));
    }

    const url = new URL(request.url);
    const isActive = url.searchParams.get('isActive');

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === 'true';

    const bankDetails = await prisma.bankDetail.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return withCORS(NextResponse.json({
      success: true,
      data: bankDetails,
      total: bankDetails.length
    }));

  } catch (error) {
    console.error('Error fetching bank details:', error);
    return withCORS(NextResponse.json(
      { success: false, error: 'Failed to fetch bank details' },
      { status: 500 }
    ));
  }
}

// POST /api/admin/bank-details - Create new bank detail
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const validation = bankDetailSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const data = validation.data;

    // Create bank detail and payment method in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create bank detail
      const bankDetail = await tx.bankDetail.create({
        data
      });

      // Auto-create payment method for this bank detail (IDR only)
      const paymentMethodCode = `manual_transfer_bank_${data.bankName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_idr`;
      const paymentMethodName = `${data.bankName} Bank Transfer (IDR)`;
      
      const paymentMethod = await tx.paymentMethod.create({
        data: {
          code: paymentMethodCode,
          name: paymentMethodName,
          description: `Manual bank transfer to ${data.bankName} account`,
          type: 'manual_transfer', // Changed from 'bank_transfer' to 'manual_transfer'
          isActive: data.isActive,
          isSystem: true, // This is system-generated
          bankDetailId: bankDetail.id
        }
      });

      return { bankDetail, paymentMethod };
    });

    return withCORS(NextResponse.json({
      success: true,
      data: {
        bankDetail: result.bankDetail,
        paymentMethod: result.paymentMethod
      },
      message: 'Bank detail created successfully and payment method auto-generated'
    }));

  } catch (error) {
    console.error('Error creating bank detail:', error);
    
    // Handle unique constraint errors for payment method code
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' && 
        'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta && 
        Array.isArray(error.meta.target) && error.meta.target.includes('code')) {
      return withCORS(NextResponse.json(
        { success: false, error: 'A payment method with similar bank name already exists. Please use a different bank name.' },
        { status: 400 }
      ));
    }
    
    return withCORS(NextResponse.json(
      { success: false, error: 'Failed to create bank detail' },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
