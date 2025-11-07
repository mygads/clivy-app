import { NextRequest, NextResponse } from 'next/server'
import { withCORS } from '@/lib/cors'
import { DuitkuPaymentGateway } from '@/lib/payment-gateway/duitku-gateway'
import { prisma } from '@/lib/prisma'
import { TransactionStatusManager } from '@/lib/transaction-status-manager'
import { PaymentNotificationService } from '@/services/payment-notification'

/**
 * Public API: Duitku Payment Callback
 * Handles payment status updates from Duitku gateway
 * 
 * According to Duitku documentation, callback data is sent as:
 * - Method: HTTP POST  
 * - Type: x-www-form-urlencoded
 * - Parameters: merchantCode, amount, merchantOrderId, productDetail, additionalParam, 
 *               paymentCode, resultCode, merchantUserId, reference, signature
 */
export async function POST(request: NextRequest) {
  console.log('[DUITKU CALLBACK] Received callback')

  try {
    // Parse callback data - Duitku sends form-encoded data
    let callbackData: any

    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Parse form-encoded data
      const formData = await request.formData()
      callbackData = Object.fromEntries(formData.entries())
      console.log('[DUITKU CALLBACK] Form data received:', callbackData)
    } else {
      // Try JSON parsing as fallback
      try {
        callbackData = await request.json()
        console.log('[DUITKU CALLBACK] JSON data received:', callbackData)
      } catch (jsonError) {
        console.error('[DUITKU CALLBACK] Failed to parse request body:', jsonError)
        return withCORS(
          NextResponse.json({ 
            success: false, 
            error: 'Invalid request format' 
          }, { status: 400 })
        )
      }
    }

    const {
      merchantCode,
      amount,
      merchantOrderId,
      productDetail,
      additionalParam,
      paymentCode,
      resultCode,
      merchantUserId,
      reference,
      signature
    } = callbackData

    console.log('[DUITKU CALLBACK] Processing:', {
      merchantOrderId,
      amount,
      resultCode,
      reference
    })

    // Validate signature using Duitku gateway
    const duitkuGateway = new DuitkuPaymentGateway()
    
    // Validate callback signature
    const isValidSignature = await duitkuGateway.validateCallback(callbackData)
    if (!isValidSignature) {
      console.error('[DUITKU CALLBACK] Invalid signature')
      return withCORS(
        NextResponse.json({ 
          success: false, 
          error: 'Invalid signature' 
        }, { status: 400 })
      )
    }

    // Extract transaction ID from merchantOrderId
    // Format: CLIVY-{transactionId}-{timestamp}
    let transactionId: string
    
    if (merchantOrderId && merchantOrderId.startsWith('CLIVY-')) {
      const merchantOrderParts = merchantOrderId.split('-')
      if (merchantOrderParts.length >= 2) {
        transactionId = merchantOrderParts[1]
      } else {
        console.error('[DUITKU CALLBACK] Invalid merchantOrderId format:', merchantOrderId)
        return withCORS(
          NextResponse.json({ 
            success: false, 
            error: 'Invalid order ID format' 
          }, { status: 400 })
        )
      }
    } else {
      console.error('[DUITKU CALLBACK] Invalid merchantOrderId:', merchantOrderId)
      return withCORS(
        NextResponse.json({ 
          success: false, 
          error: 'Invalid order ID' 
        }, { status: 400 })
      )
    }

    // Find the payment using multiple criteria
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { externalId: reference },
          { 
            transaction: { id: transactionId },
            gatewayProvider: 'duitku'
          }
        ]
      },
      include: {
        transaction: true
      }
    })

    if (!payment) {
      console.error('[DUITKU CALLBACK] Payment not found for:', {
        reference,
        merchantOrderId,
        transactionId
      })
      return withCORS(
        NextResponse.json({ 
          success: false, 
          error: 'Payment not found' 
        }, { status: 404 })
      )
    }

    console.log('[DUITKU CALLBACK] Found payment:', {
      paymentId: payment.id,
      currentStatus: payment.status,
      resultCode
    })

    // Map Duitku result codes to payment status
    let newStatus: string
    switch (resultCode) {
      case '00':
        newStatus = 'paid'
        break
      case '01':
        newStatus = 'pending'
        break
      case '02':
        newStatus = 'expired'
        break
      default:
        newStatus = 'failed'
    }

    // Idempotency check: prevent duplicate processing for same payment status
    if (payment.status === newStatus) {
      console.log('[DUITKU CALLBACK] Payment status unchanged, skipping duplicate processing:', {
        paymentId: payment.id,
        currentStatus: payment.status,
        newStatus
      })
      
      // Still return success to Duitku to acknowledge callback
      return withCORS(
        NextResponse.json({ 
          success: true,
          message: 'Callback acknowledged - no changes needed'
        })
      )
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        externalId: reference || payment.externalId,
        paymentDate: newStatus === 'paid' ? new Date() : payment.paymentDate,
        gatewayResponse: {
          ...payment.gatewayResponse as any,
          callback: {
            merchantCode,
            amount,
            merchantOrderId,
            productDetail,
            additionalParam,
            paymentCode,
            resultCode,
            merchantUserId,
            reference,
            signature,
            callbackTime: new Date().toISOString()
          }
        }
      },
      include: {
        transaction: true
      }
    })

    console.log('[DUITKU CALLBACK] Payment updated:', {
      paymentId: updatedPayment.id,
      newStatus,
      transactionId: updatedPayment.transactionId
    })

    // If payment is successful, activate services
    if (newStatus === 'paid' && updatedPayment.transactionId) {
      console.log('[DUITKU CALLBACK] Activating services for transaction:', updatedPayment.transactionId)
      
      try {
        await TransactionStatusManager.updateTransactionOnPayment(
          updatedPayment.transactionId,
          'paid'
        )
      } catch (activationError) {
        console.error('[DUITKU CALLBACK] Service activation error:', activationError)
        // Don't fail the callback if service activation fails
      }

      // Send payment success notifications (WhatsApp + Email)
      try {
        console.log('[DUITKU CALLBACK] Sending payment success notifications for payment:', updatedPayment.id)

        // Get transaction details with user and items
        const transactionWithDetails = await prisma.transaction.findUnique({
          where: { id: updatedPayment.transactionId },
          include: {
            user: true,
            whatsappTransaction: {
              include: { whatsappPackage: true }
            },
            voucher: true
          }
        })

        if (transactionWithDetails && transactionWithDetails.user) {
          // Build items array for notification (WhatsApp only)
          const items: Array<{
            name: string;
            quantity: number;
            price: number;
            type: 'whatsapp_service';
            duration?: 'month' | 'year';
          }> = []

          // Add WhatsApp service
          if (transactionWithDetails.whatsappTransaction) {
            const tws = transactionWithDetails.whatsappTransaction
            
            // Always use IDR pricing
            const whatsappPrice = tws.duration === 'year' ? tws.whatsappPackage?.priceYear : tws.whatsappPackage?.priceMonth;
            
            items.push({
              name: tws.whatsappPackage?.name || 'WhatsApp Service',
              quantity: 1, // WhatsApp services typically have quantity 1
              price: Number(whatsappPrice || 0),
              type: 'whatsapp_service',
              duration: tws.duration as 'month' | 'year'
            })
          }

          // Send comprehensive payment success notifications
          const notificationResults = await PaymentNotificationService.sendPaymentSuccessNotifications({
            paymentId: updatedPayment.id,
            transactionId: transactionWithDetails.id,
            customerName: transactionWithDetails.user.name || 'Customer',
            customerEmail: transactionWithDetails.user.email || undefined,
            customerPhone: transactionWithDetails.user.phone || undefined,
            items,
            subtotal: Number(transactionWithDetails.amount || 0),
            discountAmount: Number(transactionWithDetails.discountAmount || 0),
            serviceFeeAmount: Number(transactionWithDetails.serviceFeeAmount || 0),
            finalAmount: Number(transactionWithDetails.finalAmount || transactionWithDetails.amount || 0),
            currency: transactionWithDetails.currency,
            paymentMethod: updatedPayment.method || 'duitku',
            paymentMethodName: updatedPayment.method || 'Duitku Payment',
            paymentDate: updatedPayment.paymentDate || new Date(),
            orderDate: transactionWithDetails.createdAt
          })

          console.log('[DUITKU CALLBACK] Payment success notifications sent:', {
            paymentId: updatedPayment.id,
            whatsappSent: notificationResults.whatsappSent,
            emailSent: notificationResults.emailSent
          })
        } else {
          console.error('[DUITKU CALLBACK] Transaction or customer not found for notifications:', updatedPayment.transactionId)
        }
      } catch (notificationError) {
        console.error('[DUITKU CALLBACK] Payment success notification error:', notificationError)
        // Don't fail the callback if notification fails
      }
    }

    // Respond to Duitku - they expect specific response format
    return withCORS(
      NextResponse.json({ 
        success: true,
        message: 'Callback processed successfully'
      })
    )

  } catch (error) {
    console.error('[DUITKU CALLBACK] Error processing callback:', error)
    return withCORS(
      NextResponse.json({ 
        success: false, 
        error: 'Internal server error' 
      }, { status: 500 })
    )
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  return withCORS(
    NextResponse.json({
      message: 'Duitku callback endpoint is active',
      timestamp: new Date().toISOString()
    })
  )
}
