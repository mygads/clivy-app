import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminAuth } from '@/lib/auth-helpers';
import { withCORS, corsOptionsResponse } from '@/lib/cors';
import { z } from 'zod';

// Validation schema for bank detail update
const bankDetailUpdateSchema = z.object({
  bankName: z.string().min(1, "Bank name is required").optional(),
  accountNumber: z.string().min(1, "Account number is required").optional(),
  accountName: z.string().min(1, "Account name is required").optional(),
  swiftCode: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/bank-details/[id] - Get specific bank detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      ));
    }

    const { id } = await params;
    
    const bankDetail = await prisma.bankDetail.findUnique({
      where: { id }
    });

    if (!bankDetail) {
      return withCORS(NextResponse.json(
        { success: false, error: "Bank detail not found" },
        { status: 404 }
      ));
    }

    return withCORS(NextResponse.json({
      success: true,
      data: bankDetail
    }));

  } catch (error) {
    console.error('Error fetching bank detail:', error);
    return withCORS(NextResponse.json(
      { success: false, error: 'Failed to fetch bank detail' },
      { status: 500 }
    ));
  }
}

// PUT /api/admin/bank-details/[id] - Update bank detail
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      ));
    }

    const { id } = await params;
    const body = await request.json();
    const validation = bankDetailUpdateSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const data = validation.data;

    // Get current bank detail
    const currentBankDetail = await prisma.bankDetail.findUnique({
      where: { id },
      include: {
        paymentMethods: true
      }
    });

    if (!currentBankDetail) {
      return withCORS(NextResponse.json(
        { success: false, error: "Bank detail not found" },
        { status: 404 }
      ));
    }

    // Check if trying to activate and there's already an active one
    if (data.isActive === true) {
      const existingActive = await prisma.bankDetail.findFirst({
        where: {
          isActive: true,
          id: { not: id } // Exclude current record
        }
      });

      if (existingActive) {
        return withCORS(NextResponse.json(
          { 
            success: false, 
            error: `There is already an active bank detail. Please deactivate it first.` 
          },
          { status: 400 }
        ));
      }
    }

    // Update bank detail and sync payment method in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update bank detail
      const updatedBankDetail = await tx.bankDetail.update({
        where: { id },
        data
      });

      // Update related payment methods (always IDR)
      if (currentBankDetail.paymentMethods.length > 0) {
        const bankName = data.bankName || currentBankDetail.bankName;
        const isActive = data.isActive !== undefined ? data.isActive : currentBankDetail.isActive;

        // Update payment method name and status
        const newPaymentMethodName = `${bankName} Bank Transfer (IDR)`;
        
        await tx.paymentMethod.updateMany({
          where: { bankDetailId: id },
          data: {
            name: newPaymentMethodName,
            description: `Manual bank transfer to ${bankName} account`,
            isActive: isActive
          }
        });
      }

      return updatedBankDetail;
    });

    return withCORS(NextResponse.json({
      success: true,
      data: result,
      message: 'Bank detail updated successfully and payment method synced'
    }));

  } catch (error) {
    console.error('Error updating bank detail:', error);
    return withCORS(NextResponse.json(
      { success: false, error: 'Failed to update bank detail' },
      { status: 500 }
    ));
  }
}

// DELETE /api/admin/bank-details/[id] - Delete bank detail
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      ));
    }

    const { id } = await params;
    
    const bankDetail = await prisma.bankDetail.findUnique({
      where: { id },
      include: {
        paymentMethods: {
          where: { isActive: true }
        }
      }
    });

    if (!bankDetail) {
      return withCORS(NextResponse.json(
        { success: false, error: "Bank detail not found" },
        { status: 404 }
      ));
    }

    // Check if there are active service fees using this bank detail's payment methods
    const hasActiveServiceFees = bankDetail.paymentMethods.some(pm => pm.feeType && pm.feeValue);
    
    if (hasActiveServiceFees) {
      return withCORS(NextResponse.json(
        { success: false, error: "Cannot delete bank detail with active service fees. Please deactivate all related service fees first." },
        { status: 400 }
      ));
    }

    // Delete bank detail (payment methods will be cascade deleted)
    await prisma.bankDetail.delete({
      where: { id }
    });

    return withCORS(NextResponse.json({
      success: true,
      message: 'Bank detail and related payment methods deleted successfully'
    }));

  } catch (error) {
    console.error('Error deleting bank detail:', error);
    return withCORS(NextResponse.json(
      { success: false, error: 'Failed to delete bank detail' },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
