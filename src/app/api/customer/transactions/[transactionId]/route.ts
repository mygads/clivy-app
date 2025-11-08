import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth, getCustomerAuthErrorResponse } from "@/lib/auth-helpers";
import { PaymentExpirationService } from "@/lib/payment-expiration";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;
    const userAuth = await getCustomerAuth(request);
    if (!userAuth) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    // Auto-expire all payments and transactions
    await PaymentExpirationService.autoExpireOnApiCall();

    // console.log('[TRANSACTION_DETAIL_API] Fetching transaction:', transactionId, 'for user:', userAuth.id);

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: userAuth.id, // Ensure user can only access their own transactions
      },
      include: {
        whatsappTransaction: {
          include: {
            whatsappPackage: {
              select: {
                id: true,
                name: true,
                description: true,
                priceMonth: true,
                priceYear: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paymentDate: true,
            createdAt: true,
            expiresAt: true,
            externalId: true,
            paymentUrl: true,
          },
        },
        voucher: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            value: true,
          },
        },
      },
    });

    if (!transaction) {
      return withCORS(NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      ));
    }

    // Transform the data to match frontend expectations (same as list endpoint)
    const transformedTransaction = {
      id: transaction.id,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      type: transaction.type,
      notes: transaction.notes,
      transactionDate: transaction.transactionDate.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      discountAmount: transaction.discountAmount ? Number(transaction.discountAmount) : 0,
      serviceFeeAmount: transaction.serviceFeeAmount ? Number(transaction.serviceFeeAmount) : 0,
      finalAmount: transaction.finalAmount ? Number(transaction.finalAmount) : Number(transaction.amount),
      expiresAt: transaction.expiresAt?.toISOString(),
      payment: transaction.payment ? {
        id: transaction.payment.id,
        amount: Number(transaction.payment.amount),
        method: transaction.payment.method,
        status: transaction.payment.status,
        paymentDate: transaction.payment.paymentDate?.toISOString(),
        createdAt: transaction.payment.createdAt.toISOString(),
        expiresAt: transaction.payment.expiresAt?.toISOString(),
        externalId: transaction.payment.externalId,
        paymentUrl: transaction.payment.paymentUrl,
      } : null,
      whatsappTransaction: transaction.whatsappTransaction ? {
        id: transaction.whatsappTransaction.id,
        duration: transaction.whatsappTransaction.duration,
        status: transaction.whatsappTransaction.status,
        whatsappPackage: transaction.whatsappTransaction.whatsappPackage ? {
          id: transaction.whatsappTransaction.whatsappPackage.id,
          name: transaction.whatsappTransaction.whatsappPackage.name,
          priceMonth: Number(transaction.whatsappTransaction.whatsappPackage.priceMonth),
          priceYear: Number(transaction.whatsappTransaction.whatsappPackage.priceYear),
          description: transaction.whatsappTransaction.whatsappPackage.description,
        } : null,
      } : null,
      voucher: transaction.voucher ? {
        id: transaction.voucher.id,
        code: transaction.voucher.code,
        name: transaction.voucher.name,
        type: transaction.voucher.type,
        value: Number(transaction.voucher.value),
      } : null,
      // Build item_name for display
      item_name: (() => {
        if (transaction.whatsappTransaction?.whatsappPackage) {
          return `${transaction.whatsappTransaction.whatsappPackage.name} (${transaction.whatsappTransaction.duration})`;
        }
        return '';
      })(),
    };

    // Reset finalAmount and serviceFeeAmount if payment is cancelled/failed/expired
    // This ensures fresh calculations when user returns to checkout
    if (transaction.payment && ['cancelled', 'failed', 'expired'].includes(transaction.payment.status)) {
      transformedTransaction.finalAmount = Number(transaction.amount);
      transformedTransaction.serviceFeeAmount = 0;
    }

    return withCORS(NextResponse.json({
      success: true,
      data: transformedTransaction,
      message: "Transaction details retrieved successfully",
    }));
  } catch (error) {
    console.error("[CUSTOMER_TRANSACTION_DETAILS_GET]", error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') {
      return withCORS(NextResponse.json({
        success: false,
        error: "Database temporarily unavailable. Please try again later.",
        code: "DATABASE_UNAVAILABLE"
      }, { status: 500 }));
    }
    
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch transaction details" },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
