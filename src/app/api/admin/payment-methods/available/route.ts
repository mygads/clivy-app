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
    const currency = url.searchParams.get('currency') as 'idr' | 'usd' | null;

    // Get all active payment methods
    let whereClause: any = { isActive: true };
    
    // If currency is specified, filter by payment methods that support that currency or have no currency restriction
    if (currency) {
      whereClause = {
        isActive: true,
        OR: [
          { currency: currency },
          { currency: null } // Payment methods with no currency restriction
        ]
      };
    }

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
        currency: method.currency,
        isSystem: method.isSystem,
        hasServiceFee,
        bankDetail: method.bankDetail ? {
          bankName: method.bankDetail.bankName,
          accountNumber: method.bankDetail.accountNumber,
          accountName: method.bankDetail.accountName,
          currency: method.bankDetail.currency
        } : null,
        // Show if this payment method can be used for the specified currency
        compatibleWithCurrency: currency ? 
          (method.currency === null || method.currency === currency) : 
          true
      };
    });

    // Filter out payment methods that already have service fee for the specified currency
    const filteredMethods = currency ? 
      availablePaymentMethods.filter(method => 
        method.compatibleWithCurrency && !method.hasServiceFee
      ) : 
      availablePaymentMethods;

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
