import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth-helpers';
import { withAuthentication } from '@/lib/request-auth';
import { withCORS } from '@/lib/cors';
import { prisma } from '@/lib/prisma';

// Payment method mapping
const paymentMethodNames: { [key: string]: string } = {
  // Credit Card
  'VC': 'Credit Card',
  
  // Virtual Account
  'BC': 'BCA VA',
  'M2': 'Mandiri VA', 
  'VA': 'Maybank VA',
  'I1': 'BNI VA',
  'B1': 'CIMB Niaga VA',
  'BT': 'Permata Bank VA',
  'A1': 'ATM Bersama',
  'AG': 'Bank Artha Graha',
  'NC': 'Bank Neo Commerce',
  'BR': 'BRIVA',
  'S1': 'Bank Sahabat Sampoerna',
  'DM': 'Danamon VA',
  'BV': 'BSI VA',
  
  // Retail
  'FT': 'Pegadaian/ALFA/Pos',
  'IR': 'Indomaret',
  
  // E-Wallet
  'OV': 'OVO',
  'SA': 'Shopee Pay Apps',
  'LF': 'LinkAja Apps (Fixed)',
  'LA': 'LinkAja Apps (Percentage)',
  'DA': 'DANA',
  'SL': 'Shopee Pay Account Link',
  'OL': 'OVO Account Link',
  'JP': 'Jenius Pay',
  
  // QRIS
  'SP': 'Shopee Pay QRIS',
  'NQ': 'Nobu QRIS',
  'GQ': 'Gudang Voucher QRIS',
  'SQ': 'Nusapay QRIS',
  
  // Paylater
  'DN': 'Indodana Paylater',
  'AT': 'ATOME'
};

function extractPaymentMethodCode(method: string): string {
  // Extract payment method code from strings like 'duitku_BR'
  if (method.includes('_')) {
    const parts = method.split('_');
    const code = parts[parts.length - 1]; // Get the last part after underscore
    return paymentMethodNames[code] || code;
  }
  
  // Direct mapping if it's already a code
  return paymentMethodNames[method] || method;
}

// GET /api/customer/whatsapp/subscriptions - Get user's WhatsApp subscriptions and transaction history
export async function GET(request: NextRequest) {
  const authResult = await withAuthentication(request, async (user) => {
    try {
      // console.log('[API] Fetching WhatsApp subscriptions for user:', user.id);

      // Get all subscriptions sorted by session count (highest first), then by activation date (newest first)
      const allSubscriptions = await prisma.servicesWhatsappCustomers.findMany({
        where: {
          customerId: user.id
        },
        include: {
          package: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { package: { maxSession: 'desc' } }, // Highest session count first
          { activatedAt: 'desc' } // Most recent first
        ]
      });

      // Filter active subscriptions (status = 'active' and not expired)
      const now = new Date();
      const activeSubscriptions = allSubscriptions.filter(sub => 
        sub.status === 'active' && new Date(sub.expiredAt) > now
      );

      // Fetch transaction history for WhatsApp services - only show transactions with paid payments
      const transactionHistory = await prisma.transactionWhatsappService.findMany({
        where: {
          transaction: {
            userId: user.id,
            payment: {
              status: 'paid' // Only show transactions with paid payments
            }
          }
        },
        include: {
          transaction: {
            select: {
              id: true,
              status: true,
              amount: true,
              currency: true,
              transactionDate: true,
              createdAt: true,
              payment: {
                select: {
                  id: true,
                  status: true,
                  method: true,
                  paymentDate: true,
                  serviceFee: true
                }
              }
            }
          },
          whatsappPackage: true
        },
        orderBy: {
          transaction: {
            createdAt: 'desc'
          }
        },
        take: 50 // Limit to last 50 transactions
      });

      // Group transactions by package and sort by payment date for chronological processing
      const packageGroups = transactionHistory.reduce((acc, transaction) => {
        const packageName = transaction.whatsappPackage.name;
        if (!acc[packageName]) {
          acc[packageName] = [];
        }
        acc[packageName].push(transaction);
        return acc;
      }, {} as Record<string, typeof transactionHistory>);

      // Sort transactions within each package group by payment date (latest first for display)
      Object.keys(packageGroups).forEach(packageName => {
        packageGroups[packageName].sort((a, b) => {
          const dateA = new Date(a.transaction.payment?.paymentDate || a.transaction.createdAt).getTime();
          const dateB = new Date(b.transaction.payment?.paymentDate || b.transaction.createdAt).getTime();
          return dateB - dateA; // Latest first
        });
      });

      // Process transaction history to create chronological subscription periods
      const processedTransactionHistory = [];

      // Process each package group separately
      for (const [packageName, packageTransactions] of Object.entries(packageGroups)) {
        // Sort chronologically (earliest first) for period calculation
        const chronologicalTransactions = [...packageTransactions].sort((a, b) => {
          const dateA = new Date(a.transaction.payment?.paymentDate || a.transaction.createdAt).getTime();
          const dateB = new Date(b.transaction.payment?.paymentDate || b.transaction.createdAt).getTime();
          return dateA - dateB;
        });

        let currentPeriodStart: Date;

        // Start from the earliest transaction's payment date
        const firstTransaction = chronologicalTransactions[0];
        currentPeriodStart = new Date(firstTransaction.transaction.payment?.paymentDate || firstTransaction.transaction.createdAt);

        // Create a map of transaction periods (chronological calculation)
        const transactionPeriods = new Map();

        // Calculate periods chronologically
        for (let i = 0; i < chronologicalTransactions.length; i++) {
          const transaction = chronologicalTransactions[i];
          
          // Calculate the number of months purchased
          const packagePrice = transaction.duration === 'month' 
            ? transaction.whatsappPackage.priceMonth 
            : transaction.whatsappPackage.priceYear;
          
          const transactionAmount = Number(transaction.transaction.amount);
          let monthsPurchased = 1;
          
          if (transaction.duration === 'month') {
            monthsPurchased = Math.round(transactionAmount / packagePrice);
            if (monthsPurchased < 1) monthsPurchased = 1;
          } else if (transaction.duration === 'year') {
            monthsPurchased = 12;
          }

          // Calculate this transaction's subscription period
          const periodStartDate = new Date(currentPeriodStart);
          const periodEndDate = new Date(currentPeriodStart);
          
          if (transaction.duration === 'month') {
            periodEndDate.setMonth(periodEndDate.getMonth() + monthsPurchased);
          } else if (transaction.duration === 'year') {
            periodEndDate.setFullYear(periodEndDate.getFullYear() + 1);
          }

          // Store the period for this transaction
          transactionPeriods.set(transaction.id, {
            startDate: periodStartDate.toISOString(),
            endDate: periodEndDate.toISOString()
          });

          // Update the start date for the next transaction
          currentPeriodStart = new Date(periodEndDate);
        }

        // Now process transactions in display order (latest first) and assign their calculated periods
        for (const transaction of packageTransactions) {
          const period = transactionPeriods.get(transaction.id);
          
          // Calculate the base service amount from package price (before service fees)
          let baseServiceAmount: number;
          if (transaction.duration === 'month') {
            baseServiceAmount = transaction.whatsappPackage.priceMonth;
          } else if (transaction.duration === 'year') {
            baseServiceAmount = transaction.whatsappPackage.priceYear;
          } else {
            // Default to monthly price if duration is not clear
            baseServiceAmount = transaction.whatsappPackage.priceMonth;
          }

          // Calculate the actual service amount (what user paid for service, excluding service fees)
          const transactionAmount = Number(transaction.transaction.amount);
          const serviceFee = transaction.transaction.payment?.serviceFee ? Number(transaction.transaction.payment.serviceFee) : 0;
          
          // Service amount = Transaction amount - Service fee
          // This represents the actual cost of the WhatsApp service (after any discounts)
          let serviceAmount = transactionAmount - serviceFee;
          
          // For multi-month purchases, we might want to show the monthly equivalent
          if (transaction.duration === 'month' && serviceAmount > baseServiceAmount) {
            const monthsPurchased = Math.round(serviceAmount / baseServiceAmount);
            if (monthsPurchased > 1) {
              // Show monthly equivalent: total service amount / months purchased
              serviceAmount = serviceAmount / monthsPurchased;
            }
          }
          
          processedTransactionHistory.push({
            ...transaction,
            startDate: period.startDate,
            endDate: period.endDate,
            serviceAmount: serviceAmount, // Add the calculated service amount
            transaction: {
              ...transaction.transaction,
              payment: transaction.transaction.payment ? {
                ...transaction.transaction.payment,
                method: extractPaymentMethodCode(transaction.transaction.payment.method)
              } : null
            }
          });
        }
      }

      // Calculate stats based on highest subscription (active or latest)
      let stats = {
        activePlans: 0,
        maxSessions: 0,
        expiredDate: null as string | null,
        lastSubscriptionDate: null as string | null
      };

      let hasActiveSubscription = false;

      if (activeSubscriptions.length > 0) {
        // Use the highest active subscription (already sorted by session count desc)
        const highestActive = activeSubscriptions[0];
        hasActiveSubscription = true;
        stats = {
          activePlans: activeSubscriptions.length,
          maxSessions: highestActive.package.maxSession,
          expiredDate: highestActive.expiredAt.toISOString(),
          lastSubscriptionDate: highestActive.activatedAt.toISOString()
        };
      } else if (allSubscriptions.length > 0) {
        // No active subscriptions, use the most recent one
        const latestSub = allSubscriptions[0];
        stats = {
          activePlans: 0,
          maxSessions: latestSub.package.maxSession,
          expiredDate: latestSub.expiredAt.toISOString(),
          lastSubscriptionDate: latestSub.activatedAt.toISOString()
        };
      }

      // console.log('[API] Successfully fetched subscriptions:', {
      //   activeCount: activeSubscriptions.length,
      //   allCount: allSubscriptions.length,
      //   transactionCount: transactionHistory.length,
      //   hasActiveSubscription,
      //   stats
      // });

      return {
        success: true,
        data: {
          activeSubscriptions,
          allSubscriptions,
          transactionHistory: processedTransactionHistory,
          stats,
          hasActiveSubscription
        }
      };

    } catch (error) {
      console.error('[API] Error fetching WhatsApp subscriptions:', error);
      return {
        success: false,
        error: 'Failed to fetch WhatsApp subscriptions',
        status: 500
      };
    }
  });

  // Handle authentication result
  if ('success' in authResult && !authResult.success) {
    return withCORS(
      NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status })
    );
  }

  return withCORS(NextResponse.json(authResult));
}
