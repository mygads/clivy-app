import { NextRequest, NextResponse } from "next/server";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth } from "@/lib/auth-helpers";
import { PaymentGatewayManager } from "@/lib/payment-gateway/gateway-manager";
import { prisma } from "@/lib/prisma";

// GET /api/customer/payment/methods?currency=idr - Get available payment methods
export async function GET(request: NextRequest) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, error: "Authentication required. Please login first." },
        { status: 401 }
      ));
    }

    const searchParams = request.nextUrl.searchParams;
    const currency = searchParams.get('currency') || 'idr';

    // Validate currency - only IDR supported
    if (currency.toLowerCase() !== 'idr') {
      return withCORS(NextResponse.json(
        { success: false, error: "Only IDR currency is supported" },
        { status: 400 }
      ));
    }

    // Get available payment methods for checkout - allow methods without fee configuration
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        isActive: true
      },
      include: {
        bankDetail: true
      }
    });

    // Get full payment method details with fee configuration and bank details
    const detailedMethods = await Promise.all(
      paymentMethods.map(async (method) => {
        // Create service fee object - handle null values
        const serviceFee = method.feeType && method.feeValue ? {
          type: method.feeType,
          value: Number(method.feeValue),
          currency: 'idr',
          description: method.feeType === 'percentage' 
            ? `${Number(method.feeValue)}% fee` 
            : `Fixed fee IDR ${Number(method.feeValue).toLocaleString()}`,
          minFee: method.minFee ? Number(method.minFee) : null,
          maxFee: method.maxFee ? Number(method.maxFee) : null,
        } : {
          type: 'fixed' as const,
          value: 0,
          currency: 'idr',
          description: 'No service fee',
          minFee: null,
          maxFee: null,
        };

        return {
          code: method.code,
          name: method.name,
          type: method.type,
          isGatewayMethod: method.isGatewayMethod,
          gatewayProvider: method.gatewayProvider,
          requiresManualApproval: method.requiresManualApproval,
          serviceFee,
          bankDetail: method.bankDetail ? {
            bankName: method.bankDetail.bankName,
            accountNumber: method.bankDetail.accountNumber,
            accountName: method.bankDetail.accountName,
            swiftCode: method.bankDetail.swiftCode,
          } : null,
          paymentInstructions: method.paymentInstructions,
          instructionType: method.instructionType,
          instructionImageUrl: method.instructionImageUrl,
          gatewayImageUrl: method.gatewayImageUrl,
        };
      })
    );

    // Return all valid methods (no need to filter out nulls since we handle them above)
    const validMethods = detailedMethods;

    const response = {
      success: true,
      data: {
        currency: currency.toUpperCase(),
        paymentMethods: validMethods,
        meta: {
          totalMethods: validMethods.length,
          manualMethods: validMethods.filter(m => !m.isGatewayMethod).length,
          gatewayMethods: validMethods.filter(m => m.isGatewayMethod).length,
          availableGateways: [...new Set(validMethods.filter(m => m.gatewayProvider).map(m => m.gatewayProvider))],
        }
      },
      message: `Found ${validMethods.length} available payment methods for ${currency.toUpperCase()}`
    };

    return withCORS(NextResponse.json(response));

  } catch (error) {
    console.error("[PAYMENT_METHODS_ERROR]", error);
    
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch payment methods" },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
