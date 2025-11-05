import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { withRoleAuthentication } from "@/lib/request-auth";

// GET /api/admin/whatsapp/transactions - Get all WhatsApp transactions for admin
export async function GET(req: Request) {
  const result = await withRoleAuthentication(req, ['admin'], async (user) => {
    try {
      // Get ALL transactions that have WhatsApp service component
      const allTransactions = await prisma.transaction.findMany({
        where: { 
          whatsappTransaction: {
            isNot: null
          }
        },
        include: { 
          whatsappTransaction: {
            include: {
              whatsappPackage: true,
            },
          },
          payment: {
            select: { 
              id: true,
              status: true, 
              method: true,
              amount: true,
              expiresAt: true,
              createdAt: true 
            }
          },
          user: { select: { id: true, name: true, email: true, phone: true } },
          voucher: {
            select: {
              id: true,
              code: true,
              discountType: true,
              value: true
            }
          },
          productTransactions: true,
          addonTransactions: true
        },
        orderBy: { createdAt: 'desc' },
      });

      // console.log('[ADMIN_WHATSAPP_TRANSACTIONS] Found transactions:', allTransactions.length);

      // Transform the data to match the expected format for the dashboard
      const transformedTransactions = allTransactions.map(transaction => {
        // Calculate the correct amount based on WhatsApp package price and duration
        let calculatedAmount = Number(transaction.amount);
        
        if (transaction.whatsappTransaction?.whatsappPackage) {
          const whatsappPackage = transaction.whatsappTransaction.whatsappPackage;
          const duration = transaction.whatsappTransaction.duration;
          const currency = transaction.currency || 'idr';
          
          // Get base package price
          let packagePrice = 0;
          if (duration === 'year') {
            packagePrice = currency === 'idr' ? Number(whatsappPackage.priceYear_idr || 0) : Number(whatsappPackage.priceYear_usd || 0);
          } else if (duration === 'month') {
            packagePrice = currency === 'idr' ? Number(whatsappPackage.priceMonth_idr || 0) : Number(whatsappPackage.priceMonth_usd || 0);
          }
          
          // Apply voucher discount if exists
          let finalWhatsAppPrice = packagePrice;
          if (transaction.voucher && transaction.discountAmount) {
            const discountAmount = Number(transaction.discountAmount);
            
            if (transaction.voucher.discountType === 'percentage') {
              // Percentage discount - apply directly to WhatsApp package
              const voucherValue = Number(transaction.voucher.value || 0);
              finalWhatsAppPrice = packagePrice * (1 - (voucherValue / 100));
            } else {
              // Fixed amount discount - calculate proportional discount based on total transaction amount
              // Get total amount from transaction (before discount, excluding service fees)
              const totalTransactionAmount = Number(transaction.amount || 0);
              
              if (totalTransactionAmount > 0 && packagePrice > 0) {
                // Calculate WhatsApp proportion of total transaction
                const whatsappProportion = packagePrice / totalTransactionAmount;
                
                // Apply proportional discount to WhatsApp service
                const whatsappDiscountShare = discountAmount * whatsappProportion;
                finalWhatsAppPrice = Math.max(0, packagePrice - whatsappDiscountShare);
              } else {
                // If we can't calculate proportion, apply full discount (single service case)
                finalWhatsAppPrice = Math.max(0, packagePrice - discountAmount);
              }
            }
          }
          
          calculatedAmount = finalWhatsAppPrice;
        }
        
        // Determine transaction status based on payment status and whatsapp transaction status
        let status = transaction.status;
        
        if (transaction.payment?.status === 'paid') {
          status = 'paid';
        } else if (transaction.payment?.status === 'pending') {
          status = 'pending';
        } else if (transaction.payment?.status === 'failed' || transaction.payment?.status === 'expired' || transaction.payment?.status === 'cancelled') {
          status = 'failed';
        }
        
        return {
          id: transaction.id,
          userId: transaction.userId,
          amount: calculatedAmount, // Use calculated amount with voucher discount applied
          originalPackagePrice: transaction.whatsappTransaction?.whatsappPackage ? (
            transaction.whatsappTransaction.duration === 'year' 
              ? (transaction.currency === 'idr' ? transaction.whatsappTransaction.whatsappPackage.priceYear_idr : transaction.whatsappTransaction.whatsappPackage.priceYear_usd)
              : (transaction.currency === 'idr' ? transaction.whatsappTransaction.whatsappPackage.priceMonth_idr : transaction.whatsappTransaction.whatsappPackage.priceMonth_usd)
          ) : null,
          status: status,
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.updatedAt.toISOString(),
          notes: transaction.notes,
          currency: transaction.currency,
          discountAmount: transaction.discountAmount,
          user: transaction.user,
          voucher: transaction.voucher,
          whatsappTransaction: {
            whatsappPackage: transaction.whatsappTransaction?.whatsappPackage,
            duration: transaction.whatsappTransaction?.duration,
            status: transaction.whatsappTransaction?.status || 'pending'
          },
          payment: transaction.payment
        };
      });
      
      return withCORS(NextResponse.json({ 
        success: true, 
        data: transformedTransactions,
        debug: { 
          totalTransactions: allTransactions.length,
          transformedCount: transformedTransactions.length,
          source: 'Admin API - Transaction table with whatsappTransaction relation'
        } 
      }));
    } catch (error) {
      console.error('[ADMIN_WHATSAPP_TRANSACTIONS] API error:', error);
      return withCORS(NextResponse.json({ success: false, error: error?.toString() }));
    }
  });

  // Check if result is an error object from withRoleAuthentication
  if (result && typeof result === 'object' && 'success' in result && !result.success) {
    return withCORS(NextResponse.json({
      success: result.success,
      error: result.error
    }, { status: result.status }));
  }

  // Return the successful result
  return result as NextResponse;
}

// POST /api/admin/whatsapp/transactions - Create new WhatsApp transaction (admin only)
export async function POST(req: Request) {
  const result = await withRoleAuthentication(req, ['admin'], async (user) => {
    try {
      const body = await req.json();
      const { userId, packageId, duration } = body;
      
      if (!userId || !packageId || !['month', 'year'].includes(duration)) {
        return withCORS(NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 }));
      }

      // Check package exists
      const pkg = await prisma.whatsappApiPackage.findUnique({ where: { id: packageId } });
      if (!pkg) {
        return withCORS(NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 }));
      }

      // Default to IDR for admin-created transactions
      const amount = duration === 'year' ? pkg.priceYear_idr : pkg.priceMonth_idr;

      // Create transaction with modular structure
      const result = await prisma.$transaction(async (tx) => {
        // Create main transaction
        const transaction = await tx.transaction.create({
          data: {
            userId,
            type: 'whatsapp_service',
            amount,
            status: 'pending',
          },
        });

        // Create WhatsApp service transaction details
        await tx.transactionWhatsappService.create({
          data: {
            transactionId: transaction.id,
            whatsappPackageId: packageId,
            duration,
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
            user: { select: { id: true, name: true, email: true, phone: true } }
          },
        });
      });

      return withCORS(NextResponse.json({ success: true, data: result }));
    } catch (error) {
      return withCORS(NextResponse.json({ success: false, error: error?.toString() }));
    }
  });

  // Check if result is an error object from withRoleAuthentication
  if (result && typeof result === 'object' && 'success' in result && !result.success) {
    return withCORS(NextResponse.json({
      success: result.success,
      error: result.error
    }, { status: result.status }));
  }

  // Return the successful result
  return result as NextResponse;
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
