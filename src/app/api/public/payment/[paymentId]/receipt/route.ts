import { NextRequest, NextResponse } from 'next/server'
import { withCORS } from '@/lib/cors'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    // Get payment with basic details (no user authentication required)
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        transaction: {
          include: {
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

    // Calculate WhatsApp service total (IDR only)
    const whatsappTotal = payment.transaction?.whatsappTransaction ? 
      (payment.transaction.whatsappTransaction.duration === 'year' 
        ? Number(payment.transaction.whatsappTransaction.whatsappPackage?.priceYear || 0)
        : Number(payment.transaction.whatsappTransaction.whatsappPackage?.priceMonth || 0)
      ) : 0

    const subtotal = whatsappTotal
    const serviceFeeAmount = Number(payment.serviceFee) || 0
    const total = subtotal + serviceFeeAmount

    // Generate public receipt data (without sensitive customer info)
    const receiptData = {
      receiptNumber: `RCP-${payment.id.slice(-8).toUpperCase()}`,
      paymentId: payment.id,
      transactionId: payment.transactionId,
      issuedDate: new Date().toISOString(),
      paidDate: payment.paymentDate?.toISOString() || payment.updatedAt.toISOString(),
      
      // Payment info
      payment: {
        method: payment.method,
        amount: Number(payment.amount),
        status: payment.status,
        reference: payment.externalId || payment.id
      },
      
      // Items - WhatsApp service only
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
    console.error('Generate public receipt error:', error)
    return withCORS(NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 }))
  }
}

export async function OPTIONS() {
  return withCORS(NextResponse.json(null, { status: 200 }));
}
