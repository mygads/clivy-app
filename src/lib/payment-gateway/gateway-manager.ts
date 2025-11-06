import { PaymentGateway, PaymentRequest, PaymentResponse, PaymentMethodConfig } from './types'
import { ManualPaymentGateway } from './manual-gateway'
import { DuitkuPaymentGateway } from './duitku-gateway'
import { prisma } from '@/lib/prisma'

export class PaymentGatewayManager {
  private static instance: PaymentGatewayManager
  private gateways: Map<string, PaymentGateway> = new Map()

  private constructor() {
    // Initialize all available gateways
    this.initializeGateways()
  }

  public static getInstance(): PaymentGatewayManager {
    if (!PaymentGatewayManager.instance) {
      PaymentGatewayManager.instance = new PaymentGatewayManager()
    }
    return PaymentGatewayManager.instance
  }

  private initializeGateways() {
    // Always initialize manual gateway
    this.gateways.set('manual', new ManualPaymentGateway())
    
    // Initialize Duitku gateway (will be disabled if not configured)
    this.gateways.set('duitku', new DuitkuPaymentGateway())
  }

  /**
   * Get gateway for a specific payment method
   */
  async getGatewayForPaymentMethod(paymentMethodCode: string): Promise<PaymentGateway> {
    try {
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { code: paymentMethodCode }
      })

      if (!paymentMethod) {
        throw new Error(`Payment method ${paymentMethodCode} not found`)
      }

      // Determine gateway based on payment method configuration
      if (paymentMethod.isGatewayMethod && paymentMethod.gatewayProvider) {
        const gateway = this.gateways.get(paymentMethod.gatewayProvider)
        if (gateway && gateway.isActive) {
          return gateway
        }
      }

      // Default to manual gateway
      return this.gateways.get('manual')!
    } catch (error) {
      console.error('Error getting gateway for payment method:', error)
      // Fallback to manual gateway
      return this.gateways.get('manual')!
    }
  }

  /**
   * Create payment using appropriate gateway
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const gateway = await this.getGatewayForPaymentMethod(request.paymentMethodCode)
      return await gateway.createPayment(request)
    } catch (error) {
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment creation failed'
      }
    }
  }

  /**
   * Check payment status using appropriate gateway
   */
  async checkPaymentStatus(paymentMethodCode: string, externalId: string): Promise<PaymentResponse> {
    try {
      const gateway = await this.getGatewayForPaymentMethod(paymentMethodCode)
      return await gateway.checkPaymentStatus(externalId)
    } catch (error) {
      return {
        success: false,
        paymentId: externalId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment status check failed'
      }
    }
  }

  /**
   * Get all available payment methods from all active gateways
   */
  async getAllAvailablePaymentMethods(): Promise<PaymentMethodConfig[]> {
    const allMethods: PaymentMethodConfig[] = []

    for (const [provider, gateway] of this.gateways) {
      if (gateway.isActive) {
        try {
          const methods = await gateway.getAvailablePaymentMethods()
          allMethods.push(...methods)
        } catch (error) {
          console.error(`Error getting payment methods from ${provider}:`, error)
        }
      }
    }

    return allMethods
  }

  /**
   * Get available payment methods with active fee configuration
   * Currency parameter removed - now only uses IDR
   */
  async getAvailablePaymentMethodsForCheckout(): Promise<PaymentMethodConfig[]> {
    try {
      // Get active payment methods that have fee configuration
      const paymentMethods = await prisma.paymentMethod.findMany({
        where: {
          isActive: true,
          feeType: { not: null },
          feeValue: { not: null }
        },
        include: {
          bankDetail: true
        }
      })

      const availableMethods: PaymentMethodConfig[] = []

      for (const method of paymentMethods) {
        availableMethods.push({
            code: method.code,
            name: method.name,
            type: method.type,
            gatewayCode: method.gatewayCode || undefined,
            isActive: method.isActive
          })
      }

      return availableMethods
    } catch (error) {
      console.error('Error getting available payment methods for checkout:', error)
      return []
    }
  }

  /**
   * Process callback from gateway
   */
  async processCallback(gatewayProvider: string, data: any) {
    const gateway = this.gateways.get(gatewayProvider)
    if (!gateway || !gateway.isActive) {
      throw new Error(`Gateway ${gatewayProvider} not found or not active`)
    }

    return await gateway.processCallback(data)
  }

  /**
   * Get gateway status and configuration
   */
  async getGatewayStatus() {
    const status: Record<string, any> = {}

    for (const [provider, gateway] of this.gateways) {
      status[provider] = {
        isActive: gateway.isActive,
        isConfigured: await gateway.validateConfiguration()
      }
    }

    return status
  }
}
