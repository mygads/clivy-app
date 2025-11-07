import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getAdminAuth } from "@/lib/auth-helpers";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// GET /api/admin/payment-methods/available - Get payment methods available for service fee creation
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
    const currency = url.searchParams.get('currency') as 'idr' | null;

    // Get all active payment methods (IDR only)
    const whereClause: any = { isActive: true };

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: whereClause,
      include: {
        bankDetail: true
      },
      orderBy: [
        { isSystem: 'asc' }, // Manual methods first
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    // Transform data for frontend form usage
    const availablePaymentMethods = paymentMethods.map(method => {
      const hasServiceFee = method.feeType && method.feeValue;

      return {
        code: method.code,
        name: method.name,
        description: method.description,
        type: method.type,
        currency: 'idr', // IDR only
        isSystem: method.isSystem,
        hasServiceFee,
        bankDetail: method.bankDetail ? {
          bankName: method.bankDetail.bankName,
          accountNumber: method.bankDetail.accountNumber,
          accountName: method.bankDetail.accountName,
          currency: 'idr' // IDR only
        } : null,
        compatibleWithCurrency: true // Always true for IDR-only system
      };
    });

    // Filter out payment methods that already have service fee
    const filteredMethods = availablePaymentMethods.filter(method => 
      !method.hasServiceFee
    );

    return withCORS(NextResponse.json({
      success: true,
      data: {
        paymentMethods: filteredMethods,
        currency: currency,
        total: filteredMethods.length
      },
      message: currency ? 
        `Found ${filteredMethods.length} payment methods available for ${currency.toUpperCase()} service fees` :
        `Found ${filteredMethods.length} payment methods`
    }));
  } catch (error) {
    console.error("[AVAILABLE_PAYMENT_METHODS_GET]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch available payment methods" },
      { status: 500 }
    ));
  }
}
