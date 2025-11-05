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
    await PaymentExpirationService.autoExpireOnApiCall();    // Get all transactions for this user
    const transactions = await prisma.transaction.findMany({
      where: { userId },      include: {
        payment: true,
        productTransactions: {
          include: {
            package: {
              select: {
                id: true,
                name_en: true,
                name_id: true,
                price_idr: true,
                price_usd: true,
              }
            }
          }
        },
        addonTransactions: {
          include: {
            addon: {
              select: {
                id: true,
                name_en: true,
                name_id: true,
                price_idr: true,
                price_usd: true,
              }
            }
          }
        },
        whatsappTransaction: {
          include: {
            whatsappPackage: {
              select: {
                id: true,
                name: true,
                description: true,
                priceMonth_idr: true,
                priceMonth_usd: true,
                priceYear_idr: true,
                priceYear_usd: true,
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

    // Calculate transaction summaries
    const transactionSummary = {
      success: {
        total: 0,
        product: 0,
        whatsapp: 0,
        addons: 0,
      },
      pending: {
        awaitingPayment: 0,
        awaitingVerification: 0,
      },
      failed: 0,
      totalOverall: transactions.length,
    };

    // Get successful product transactions for delivery status
    const successfulProductTransactions: Array<{
      id: string;
      packageName: string;
      addonName: string | null;
      status: string;
      delivered: boolean;
      createdAt: Date;
      amount: any;
      currency: string;
    }> = [];
    
    // Get recent purchase history
    const recentProductHistory: Array<{
      id: string;
      packageName: string;
      addonName: string | null;
      amount: any;
      currency: string;
      createdAt: Date;
    }> = [];
      const recentWhatsappHistory: Array<{
      id: string;
      packageName: string;
      duration: string;
      amount: any;
      currency: string;
      createdAt: Date;    }> = [];

    // Recent transactions combining all types
    const recentTransactions: Array<{
      id: string;
      type: string;
      name: string;
      amount: any;
      currency: string;
      status: string;
      createdAt: Date;
    }> = [];    
      // Get all product service records for this user's transactions
    const transactionIds = transactions.map(t => t.id);
    const productCustomers = await prisma.servicesProductCustomers.findMany({
      where: { transactionId: { in: transactionIds } }
    });
    
    // Create map for quick lookup
    const productCustomerMap = new Map();
    productCustomers.forEach(pc => {
      productCustomerMap.set(pc.transactionId, pc);
    });

    transactions.forEach(transaction => {
      const hasSuccessfulPayment = transaction.payment?.status === 'paid';
      const hasPendingPayment = transaction.payment?.status === 'pending';
      const hasFailedPayment = transaction.payment?.status === 'failed';
      
      // Add to recent transactions list (limit to 10)
      if (recentTransactions.length < 10) {
        let transactionName = 'Unknown';
        let transactionType = 'other';
        
        if (transaction.productTransactions && transaction.productTransactions.length > 0) {
          transactionName = transaction.productTransactions[0].package?.name_en || 'Product Package';
          transactionType = 'product';
        } else if (transaction.addonTransactions && transaction.addonTransactions.length > 0) {
          transactionName = transaction.addonTransactions[0].addon?.name_en || 'Addon Service';
          transactionType = 'addon';
        } else if (transaction.whatsappTransaction) {
          transactionName = transaction.whatsappTransaction.whatsappPackage?.name || 'WhatsApp Package';
          transactionType = 'whatsapp';
        }
        
        recentTransactions.push({
          id: transaction.id,
          type: transactionType,
          name: transactionName,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.payment?.status || transaction.status,
          createdAt: transaction.createdAt,
        });
      }

      if (hasSuccessfulPayment) {
        transactionSummary.success.total++;
        
        if (transaction.productTransactions && transaction.productTransactions.length > 0) {
          transactionSummary.success.product++;
          
          // Handle multiple products in transaction
          transaction.productTransactions.forEach(productTx => {
            // Get delivery status from ServicesProductCustomers
            const productCustomer = productCustomerMap.get(transaction.id);
            const isDelivered = productCustomer?.status === 'delivered';
            
            successfulProductTransactions.push({
              id: transaction.id,
              packageName: productTx.package?.name_en || 'N/A',
              addonName: null, // Add-ons are now separate
              status: productCustomer?.status || 'awaiting_delivery',
              delivered: isDelivered,
              createdAt: transaction.createdAt,
              amount: transaction.amount,
              currency: transaction.currency,
            });
            
            // Add to recent history (limit to 5 per product)
            if (recentProductHistory.length < 5) {
              recentProductHistory.push({
                id: transaction.id,                packageName: productTx.package?.name_en || 'N/A',
                addonName: null, // Add-ons are now separate
                amount: transaction.amount,
                currency: transaction.currency,
                createdAt: transaction.createdAt,
              });
            }
          });
        }

        if (transaction.addonTransactions && transaction.addonTransactions.length > 0) {
          transactionSummary.success.addons++;
        }
        
        if (transaction.whatsappTransaction) {
          transactionSummary.success.whatsapp++;
          
          // Add to recent history (limit to 5)
          if (recentWhatsappHistory.length < 5) {
            recentWhatsappHistory.push({
              id: transaction.id,
              packageName: transaction.whatsappTransaction.whatsappPackage?.name || 'N/A',
              duration: transaction.whatsappTransaction.duration,
              amount: transaction.amount,
              currency: transaction.currency,
              createdAt: transaction.createdAt,
            });
          }
        }} else if (hasPendingPayment) {
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

    // Product delivery status log
    const productDeliveryLog = successfulProductTransactions.map(transaction => ({
      transactionId: transaction.id,
      packageName: transaction.packageName,
      addonName: transaction.addonName,
      isDelivered: transaction.delivered,
      amount: transaction.amount,
      currency: transaction.currency,
      createdAt: transaction.createdAt,
    }));

    const dashboardData = {
      transactionSummary,
      productDeliveryLog,
      recentHistory: {
        products: recentProductHistory,
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
