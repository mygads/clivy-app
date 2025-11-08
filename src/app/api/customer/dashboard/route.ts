import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth, getCustomerAuthErrorResponse } from "@/lib/auth-helpers";
import { PaymentExpirationService } from "@/lib/payment-expiration";

// GET /api/customer/dashboard - Get customer dashboard summary
export async function GET(request: NextRequest) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    const userId = userAuth.id;

    // Auto-expire payments and transactions
    await PaymentExpirationService.autoExpireOnApiCall();    // Get all transactions for this user (WhatsApp only now)
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        payment: true,
        whatsappTransaction: {
          include: {
            whatsappPackage: {
              select: {
                id: true,
                name: true,
                description: true,
                priceMonth: true,
                priceYear: true,
              }
            }
          }
        },
        voucher: {
          select: {
            id: true,
            code: true,
            type: true,
            value: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate transaction summaries (WhatsApp only)
    const transactionSummary = {
      success: {
        total: 0,
        whatsapp: 0,
      },
      pending: {
        awaitingPayment: 0,
        awaitingVerification: 0,
      },
      failed: 0,
      totalOverall: transactions.length,
    };

    // Get recent WhatsApp purchase history
    const recentWhatsappHistory: Array<{
      id: string;
      packageName: string;
      duration: string;
      amount: any;
      currency: string;
      createdAt: Date;
    }> = [];

    // Recent transactions (WhatsApp only)
    const recentTransactions: Array<{
      id: string;
      type: string;
      name: string;
      amount: any;
      currency: string;
      status: string;
      createdAt: Date;
    }> = [];

    transactions.forEach(transaction => {
      const hasSuccessfulPayment = transaction.payment?.status === 'paid';
      const hasPendingPayment = transaction.payment?.status === 'pending';
      const hasFailedPayment = transaction.payment?.status === 'failed';
      
      // Add to recent transactions list (limit to 10, WhatsApp only)
      if (recentTransactions.length < 10) {
        let transactionName = 'Unknown';
        let transactionType = 'other';
        
        if (transaction.whatsappTransaction) {
          transactionName = transaction.whatsappTransaction.whatsappPackage?.name || 'WhatsApp Package';
          transactionType = 'whatsapp';
        }
        
        recentTransactions.push({
          id: transaction.id,
          type: transactionType,
          name: transactionName,
          amount: transaction.amount,
          currency: transaction.currency || 'IDR',
          status: transaction.payment?.status || transaction.status,
          createdAt: transaction.createdAt,
        });
      }

      if (hasSuccessfulPayment) {
        transactionSummary.success.total++;
        
        if (transaction.whatsappTransaction) {
          transactionSummary.success.whatsapp++;
          
          // Add to recent history (limit to 5)
          if (recentWhatsappHistory.length < 5) {
            recentWhatsappHistory.push({
              id: transaction.id,
              packageName: transaction.whatsappTransaction.whatsappPackage?.name || 'N/A',
              duration: transaction.whatsappTransaction.duration,
              amount: transaction.amount,
              currency: transaction.currency || 'IDR',
              createdAt: transaction.createdAt,
            });
          }
        }
      } else if (hasPendingPayment) {
        // Check if it's awaiting payment or verification
        const pendingPayment = transaction.payment;
        if (pendingPayment?.method?.includes('manual') || pendingPayment?.method?.includes('bank_transfer')) {
          transactionSummary.pending.awaitingVerification++;
        } else {
          transactionSummary.pending.awaitingPayment++;
        }
      } else if (hasFailedPayment || transaction.status === 'failed') {
        transactionSummary.failed++;
      }
    });

    const dashboardData = {
      transactionSummary,
      recentHistory: {
        whatsapp: recentWhatsappHistory,
        transactions: recentTransactions,
      },
      lastUpdated: new Date().toISOString(),
    };

    return withCORS(NextResponse.json({
      success: true,
      data: dashboardData
    }));

  } catch (error) {
    console.error("[CUSTOMER_DASHBOARD_GET]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
