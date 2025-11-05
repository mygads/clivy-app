import { PaymentGateway, PaymentRequest, PaymentResponse, PaymentCallback, PaymentMethodConfig } from './types'
import { prisma } from '@/lib/prisma'

export class ManualPaymentGateway implements PaymentGateway {
  provider = 'manual'
  isActive = true

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // For manual payments, we don't create external payment
      // Just return pending status requiring manual approval
      return {
        success: true,
        paymentId: `manual_${request.transactionId}`,
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    } catch (error) {
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to create manual payment'
      }
    }
  }

  async checkPaymentStatus(externalId: string): Promise<PaymentResponse> {
    try {
      // For manual payments, check database status
      const payment = await prisma.payment.findFirst({
        where: { externalId }
      })

      if (!payment) {
        return {
          success: false,
          paymentId: externalId,
          status: 'failed',
          error: 'Payment not found'
        }
      }

      return {
        success: true,
        paymentId: payment.id,
        status: payment.status as 'pending' | 'paid' | 'failed' | 'expired',
        expiresAt: payment.expiresAt || undefined
      }
    } catch (error) {
      return {
        success: false,
        paymentId: externalId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to check payment status'
      }
    }
  }

  async processCallback(data: any): Promise<PaymentCallback> {
    // Manual payments don't have callbacks from external systems
    // This would be used for admin approval actions
    throw new Error('Manual payments do not support external callbacks')
  }

  async getAvailablePaymentMethods(): Promise<PaymentMethodConfig[]> {
    try {
      // Get all active manual payment methods from database
      const paymentMethods = await prisma.paymentMethod.findMany({
        where: {
          isActive: true,
          isGatewayMethod: false
        },
        include: {
          bankDetail: true
        }
      })

      return paymentMethods.map(method => ({
        code: method.code,
        name: method.name,
        type: method.type,
        currency: method.currency || undefined,
        isActive: method.isActive
      }))
    } catch (error) {
      console.error('Error getting manual payment methods:', error)
      return []
    }
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      // Check if there are any active bank details
      const activeBankDetails = await prisma.bankDetail.findMany({
        where: { isActive: true }
      })
      
      return activeBankDetails.length > 0
    } catch (error) {
      console.error('Error validating manual payment configuration:', error)
      return false
    }
  }
}
