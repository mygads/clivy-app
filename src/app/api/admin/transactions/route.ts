import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserToken, getAdminAuth } from '@/lib/auth-helpers';
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { PaymentExpirationService } from "@/lib/payment-expiration";
import { z } from "zod";

function getTransactionStatusText(status: string) {
  switch (status) {
    case 'created':
      return 'Created';
    case 'pending':
      return 'Payment Pending';
    case 'in-progress':
      return 'In Progress';
    case 'success':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
}

function getPaymentStatusText(status: string) {
  switch (status) {
    case 'pending':
      return 'Pending Payment';
    case 'paid':
      return 'Paid';
    case 'failed':
      return 'Payment Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

const createTransactionSchema = z.object({
  // WhatsApp service transaction fields
  whatsappPackageId: z.string().cuid(),
  duration: z.enum(['month', 'year']),
});

// GET /api/admin/transactions - Get all transactions for admin (admin only)
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      ));
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'product' | 'whatsapp_service' | null (all)
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const whereCondition: any = {};

    // Admin can see all transactions (no userId filter)

    if (type) {
      whereCondition.type = type;
    }

    if (status) {
      whereCondition.status = status;
    }    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereCondition,
        include: {
          payment: true,
          whatsappTransaction: {
            include: {
              whatsappPackage: true,
            },
          },
          voucher: {
            select: {
              id: true,
              code: true,
              type: true,
              value: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where: whereCondition }),
    ]);    const formattedTransactions = transactions.map(trx => {
      return {
        ...trx,
        amount: Number(trx.amount),
        item_name: trx.type === 'whatsapp_service'
          ? trx.whatsappTransaction?.whatsappPackage?.name || 'WhatsApp Service'
          : 'WhatsApp Service',
        canRetryPayment: trx.status === 'created' || trx.status === 'pending' || trx.status === 'expired',
        canConfirmTransaction: false,
        durationText: trx.type === 'whatsapp_service' && trx.whatsappTransaction?.duration
          ? `${trx.whatsappTransaction.duration === 'year' ? '1 Year' : '1 Month'}`
          : null,
        transactionStatusText: getTransactionStatusText(trx.status),
        paymentStatusText: getPaymentStatusText(trx.payment?.status || 'pending'),
      };
    });

    return withCORS(NextResponse.json({
      success: true,
      data: formattedTransactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    }));
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    ));
  }
}

// POST /api/transactions - Create new transaction (unified)
export async function POST(request: NextRequest) {
  try {
    const userVerification = await verifyUserToken(request);
    if (!userVerification.success) {
      return withCORS(NextResponse.json(
        { success: false, error: userVerification.error },
        { status: 401 }
      ));
    }

    const userId = userVerification.userId;

    const body = await request.json();
    const validation = createTransactionSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { 
      whatsappPackageId, 
      duration,
    } = validation.data;

    // Calculate amount for WhatsApp service transaction
    const pkg = await prisma.whatsappApiPackage.findUnique({
      where: { id: whatsappPackageId },
    });
    
    if (!pkg) {
      return withCORS(NextResponse.json(
        { success: false, error: "WhatsApp package not found" },
        { status: 404 }
      ));
    }
    
    // Use IDR pricing only
    const amount = duration === 'year' ? pkg.priceYear : pkg.priceMonth;

    // Create transaction with nested details in a transaction block
    const result = await prisma.$transaction(async (tx) => {
      // Create main transaction with automatic expiration (1 week)
      const transaction = await PaymentExpirationService.createTransactionWithExpiration({
        userId: userId,
        amount: amount,
        type: 'whatsapp_service',
        currency: 'idr',
      });

      // Create WhatsApp service transaction details
      await tx.transactionWhatsappService.create({
        data: {
          transactionId: transaction.id,
          whatsappPackageId: whatsappPackageId,
          duration: duration,
          startDate: null, // Will be set when payment is confirmed
          endDate: null,   // Will be calculated when payment is confirmed
        },
      });

      // Return transaction with details
      return await tx.transaction.findUnique({
        where: { id: transaction.id },
        include: {
          whatsappTransaction: {
            include: {
              whatsappPackage: true,
            },
          },
        },
      });
    });

    const transaction = result!;

    return withCORS(NextResponse.json({
      success: true,
      data: {
        ...transaction,
        amount: Number(transaction.amount),
        item_name: transaction.whatsappTransaction?.whatsappPackage?.name || 'WhatsApp Service',
        item_type: 'whatsapp_service',        
        transactionStatusText: getTransactionStatusText(transaction.status),
        paymentStatusText: getPaymentStatusText('pending'), // No payment created yet
        canRetryPayment: transaction.status === 'created',
        canConfirmTransaction: false,
      },
      message: "Transaction created successfully. Proceed with payment.",
    }));
  } catch (error) {
    console.error("[TRANSACTIONS_POST]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to create transaction" },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
