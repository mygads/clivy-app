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
            whatsappTransaction: {
              include: {
                whatsappPackage: {
                  select: {
                    name: true,
                    priceMonth: true,
                    priceYear: true
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

    // Calculate totals for WhatsApp service (IDR only)
    const whatsappTotal = payment.transaction?.whatsappTransaction ? 
      (payment.transaction.whatsappTransaction.duration === 'year' 
        ? Number(payment.transaction.whatsappTransaction.whatsappPackage?.priceYear || 0)
        : Number(payment.transaction.whatsappTransaction.whatsappPackage?.priceMonth || 0)
      ) : 0

    const subtotal = whatsappTotal
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
        ...(payment.transaction?.whatsappTransaction ? [{
          type: 'WhatsApp Service',
          name: payment.transaction.whatsappTransaction.whatsappPackage?.name || 'WhatsApp Service',
          description: `${payment.transaction.whatsappTransaction.duration} subscription`,
          quantity: 1,
          unitPrice: whatsappTotal,
          total: whatsappTotal,
          currency: 'idr'
        }] : [])
      ],
      
      // Totals
      totals: {
        subtotal,
        serviceFee: serviceFeeAmount,
        total,
        currency: 'idr'
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
