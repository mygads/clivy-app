import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth, getCustomerAuthErrorResponse } from "@/lib/auth-helpers";
import { PaymentExpirationService } from "@/lib/payment-expiration";
import { z } from "zod";
import { detectCurrencySync } from "@/lib/currency-detection";

// Schema no longer used - WhatsApp transactions handled differently
// Keeping for backward compatibility but validation removed

export async function OPTIONS() {
  return corsOptionsResponse();
}

// GET /api/customer/transactions - Get user's transactions
export async function GET(request: NextRequest) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    // Auto-expire all payments and transactions
    await PaymentExpirationService.autoExpireOnApiCall();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const whereClause: any = { userId: userAuth.id };
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // console.log('[TRANSACTIONS_API] Fetching transactions for user:', userAuth.id, 'with filters:', whereClause);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          whatsappTransaction: {
            include: {
              whatsappPackage: {
                select: {
                  id: true,
                  name: true,
                  priceMonth: true,
                  priceYear: true,
                  description: true,
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
        orderBy: { transactionDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    // console.log('[TRANSACTIONS_API] Found', transactions.length, 'transactions out of', total, 'total');

    // Transform the data to match frontend expectations
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      type: transaction.type,
      notes: transaction.notes,
      transactionDate: transaction.transactionDate.toISOString(),
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
    }));

    return withCORS(NextResponse.json({
      success: true,
      data: transformedTransactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
      message: `Found ${transformedTransactions.length} transactions`,
    }));
  } catch (error) {
    console.error("[CUSTOMER_TRANSACTIONS_GET] Error:", error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') {
      return withCORS(NextResponse.json({
        success: false,
        error: "Database temporarily unavailable. Please try again later.",
        code: "DATABASE_UNAVAILABLE"
      }, { status: 500 }));
    }
    
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    ));
  }
}

// POST /api/customer/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    // This endpoint is no longer supported
    return withCORS(NextResponse.json(
      { success: false, error: "This transaction type is no longer supported. Please use WhatsApp services." },
      { status: 410 }
    ));
  } catch (error) {
    console.error("Transaction creation error:", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to create transaction" },
      { status: 500 }
    ));
  }
}
