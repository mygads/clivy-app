import { NextRequest, NextResponse } from 'next/server'
import { getCustomerAuth, getCustomerAuthErrorResponse } from '@/lib/auth-helpers'
import { withCORS } from '@/lib/cors'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { detectCurrencySync } from "@/lib/currency-detection"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    // Authenticate customer
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    const { paymentId } = await params;

    // Get payment with full details
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        transaction: {
          userId: userAuth.id
        }
      },
      include: {
        transaction: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            productTransactions: {
              include: {
                package: {
                  select: {
                    name_en: true,
                    name_id: true,
                    price_idr: true,
                    price_usd: true
                  }
                }
              }
            },
            addonTransactions: {
              include: {
                addon: {
                  select: {
                    name_en: true,
                    name_id: true,
                    price_idr: true,
                    price_usd: true
                  }
                }
              }
            },
            whatsappTransaction: {
              include: {
                whatsappPackage: {
                  select: {
                    name: true,
                    priceMonth_idr: true,
                    priceMonth_usd: true,
                    priceYear_idr: true,
                    priceYear_usd: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!payment) {
      return withCORS(NextResponse.json({
        success: false,
        error: "Payment not found"
      }, { status: 404 }))
    }

    // Only allow receipt generation for paid payments
    if (payment.status !== 'paid') {
      return withCORS(NextResponse.json({
        success: false,
        error: "Receipt is only available for paid payments"
      }, { status: 400 }))
    }

    // Calculate price helper
    const calculatePrice = (priceIdr: any, priceUsd: any, currency: string) => {
      if (currency === 'usd') {
        return Number(priceUsd || 0);
      }
      return Number(priceIdr || 0);
    };

    // Calculate totals
    const productTotal = payment.transaction?.productTransactions.reduce((sum, item) => 
      sum + (calculatePrice(item.package?.price_idr, item.package?.price_usd, payment.transaction!.currency || 'idr') * item.quantity), 0
    ) || 0
    
    const addonTotal = payment.transaction?.addonTransactions.reduce((sum, item) => 
      sum + (calculatePrice(item.addon?.price_idr, item.addon?.price_usd, payment.transaction!.currency || 'idr') * item.quantity), 0
    ) || 0
    
    const whatsappTotal = payment.transaction?.whatsappTransaction ? 
      (payment.transaction.whatsappTransaction.duration === 'year' 
        ? (payment.transaction.currency === 'usd' 
          ? Number(payment.transaction.whatsappTransaction.whatsappPackage?.priceYear_usd || 0)
          : Number(payment.transaction.whatsappTransaction.whatsappPackage?.priceYear_idr || 0))
        : (payment.transaction.currency === 'usd' 
          ? Number(payment.transaction.whatsappTransaction.whatsappPackage?.priceMonth_usd || 0)
          : Number(payment.transaction.whatsappTransaction.whatsappPackage?.priceMonth_idr || 0))
      ) : 0

    const subtotal = productTotal + addonTotal + whatsappTotal
    const serviceFeeAmount = Number(payment.serviceFee) || 0
    const total = subtotal + serviceFeeAmount

    // Generate receipt data
    const receiptData = {
      receiptNumber: `RCP-${payment.id.slice(-8).toUpperCase()}`,
      paymentId: payment.id,
      transactionId: payment.transactionId,
      issuedDate: new Date().toISOString(),
      paidDate: payment.paymentDate?.toISOString() || payment.updatedAt.toISOString(),
      
      // Customer info
      customer: {
        name: payment.transaction?.user?.name || 'N/A',
        email: payment.transaction?.user?.email || 'N/A',
        phone: payment.transaction?.user?.phone || 'N/A'
      },
      
      // Payment info
      payment: {
        method: payment.method,
        amount: Number(payment.amount),
        status: payment.status,
        reference: payment.externalId || payment.id
      },
      
      // Items
      items: [
        ...(payment.transaction?.productTransactions.map(item => ({
          type: 'Product',
          name: item.package?.name_en || item.package?.name_id || 'Unknown Product',
          description: item.package?.name_id || 'Product package',
          quantity: item.quantity,
          unitPrice: calculatePrice(item.package?.price_idr, item.package?.price_usd, payment.transaction!.currency || 'idr'),
          total: calculatePrice(item.package?.price_idr, item.package?.price_usd, payment.transaction!.currency || 'idr') * item.quantity,
          currency: payment.transaction?.currency || 'idr'
        })) || []),
        ...(payment.transaction?.addonTransactions.map(item => ({
          type: 'Add-on',
          name: item.addon?.name_en || item.addon?.name_id || 'Unknown Addon',
          description: item.addon?.name_id || 'Product addon',
          quantity: item.quantity,
          unitPrice: calculatePrice(item.addon?.price_idr, item.addon?.price_usd, payment.transaction!.currency || 'idr'),
          total: calculatePrice(item.addon?.price_idr, item.addon?.price_usd, payment.transaction!.currency || 'idr') * item.quantity,
          currency: payment.transaction?.currency || 'idr'
        })) || []),
        ...(payment.transaction?.whatsappTransaction ? [{
          type: 'WhatsApp Service',
          name: payment.transaction.whatsappTransaction.whatsappPackage?.name || 'WhatsApp Service',
          description: `${payment.transaction.whatsappTransaction.duration} subscription`,
          quantity: 1,
          unitPrice: whatsappTotal,
          total: whatsappTotal,
          currency: payment.transaction?.currency || 'idr'
        }] : [])
      ],
      
      // Totals
      totals: {
        subtotal,
        serviceFee: serviceFeeAmount,
        total,
        currency: payment.transaction?.currency || 'idr'
      }
    }

    return withCORS(NextResponse.json({
      success: true,
      receipt: receiptData
    }))

  } catch (error) {
    console.error('Generate receipt error:', error)
    return withCORS(NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 }))
  }
}
