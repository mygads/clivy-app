import { PaymentGateway, PaymentRequest, PaymentResponse, PaymentCallback, PaymentMethodConfig } from './types'
import { prisma } from '@/lib/prisma'
import { validatePaymentAmount } from './payment-limits'
import crypto from 'crypto'

export class DuitkuPaymentGateway implements PaymentGateway {
  provider = 'duitku'
  isActive = true

  private merchantCode: string
  private apiKey: string
  private baseUrl: string
  private isProduction: boolean

  constructor() {
    this.merchantCode = process.env.DUITKU_MERCHANT_CODE || ''
    this.apiKey = process.env.DUITKU_API_KEY || ''
    this.baseUrl = process.env.DUITKU_BASE_URL || 'https://sandbox.duitku.com/webapi/api/merchant'
    this.isProduction = !this.baseUrl.includes('sandbox')
    
    // Log configuration for debugging
    console.log('[DUITKU] Gateway initialized:', {
      merchantCode: this.merchantCode ? 'SET' : 'MISSING',
      apiKey: this.apiKey ? 'SET' : 'MISSING',
      baseUrl: this.baseUrl,
      isProduction: this.isProduction
    });
  }

  /**
   * Generate MD5 signature untuk request transaksi
   * Formula: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
   */
  private generateTransactionSignature(merchantOrderId: string, paymentAmount: number): string {
    const data = `${this.merchantCode}${merchantOrderId}${paymentAmount}${this.apiKey}`
    return crypto.createHash('md5').update(data).digest('hex')
  }

  /**
   * Generate SHA256 signature untuk get payment methods
   * Formula: SHA256(merchantcode + paymentAmount + datetime + apiKey)
   */
  private generatePaymentMethodSignature(paymentAmount: number, datetime: string): string {
    const data = `${this.merchantCode}${paymentAmount}${datetime}${this.apiKey}`
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * Generate MD5 signature untuk check transaction status
   * Formula: MD5(merchantCode + merchantOrderId + apiKey)
   */
  private generateStatusSignature(merchantOrderId: string): string {
    const data = `${this.merchantCode}${merchantOrderId}${this.apiKey}`
    return crypto.createHash('md5').update(data).digest('hex')
  }

  /**
   * Get appropriate expiry period in minutes based on payment method
   * According to Duitku documentation - using maximum expiry periods
   */
  private getExpiryPeriod(paymentMethod: string): number {
    const expiryMapping: { [key: string]: number } = {
      // Credit Card - 30 minutes (fixed, cannot be changed)
      'VC': 30,
      
      // Virtual Account - maximum >1440 minutes (use 1440 for consistency)
      'BC': 1440,   // BCA VA
      'M2': 1440,   // Mandiri VA
      'VA': 1440,   // Maybank VA
      'I1': 1440,   // BNI VA
      'B1': 1440,   // CIMB Niaga VA
      'BT': 1440,   // Permata Bank VA
      'A1': 1440,   // ATM Bersama
      'AG': 1440,   // Bank Artha Graha
      'NC': 1440,   // Bank Neo Commerce/BNC
      'BR': 1440,   // BRIVA
      'S1': 1440,   // Bank Sahabat Sampoerna
      'DM': 1440,   // Danamon VA
      'BV': 1440,   // BSI VA
      
      // Retail - maximum >1440 minutes (use 1440 for consistency)
      'FT': 1440,   // Pegadaian/ALFA/Pos
      'IR': 1440,   // Indomaret
      
      // E-Wallet - use maximum allowed periods
      'OV': 1440,   // OVO - max 1440 minutes
      'SA': 60,     // Shopee Pay Apps - max 60 minutes
      'LF': 1440,   // LinkAja Apps (Fixed Fee) - max 1440 minutes
      'LA': 1440,   // LinkAja Apps (Percentage Fee) - max 1440 minutes
      'DA': 1440,   // DANA - max 1440 minutes
      'SL': 30,     // Shopee Pay Account Link - 30 minutes (fixed)
      'OL': 15,     // OVO Account Link - 15 minutes (fixed)
      'JP': 10,     // Jenius Pay - max 10 minutes
      
      // QRIS - use maximum allowed periods
      'SP': 60,     // Shopee Pay QRIS - max 60 minutes
      'NQ': 1440,   // Nobu QRIS - max 1440 minutes
      'GQ': 60,     // Gudang Voucher QRIS - max 60 minutes
      'SQ': 60,     // Nusapay QRIS - max 60 minutes
      
      // Paylater - use maximum allowed periods
      'DN': 1440,   // Indodana Paylater - max 1440 minutes
      'AT': 720,    // ATOME - max 720 minutes
    }
    
    return expiryMapping[paymentMethod] || 1440 // Default to 1440 minutes (24 hours)
  }

  /**
   * Calculate expiry time based on payment method
   * For manual bank transfer: 24 hours (1440 minutes)
   * For Duitku methods: according to documentation
   */
  private calculateExpiryTime(paymentMethod: string, isManualTransfer: boolean = false): Date {
    if (isManualTransfer) {
      // Manual bank transfer gets 24 hours
      return new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
    
    const expiryMinutes = this.getExpiryPeriod(paymentMethod)
    return new Date(Date.now() + expiryMinutes * 60 * 1000)
  }

  /**
   * Generate MD5 signature untuk callback validation
   * Formula: MD5(merchantcode + amount + merchantOrderId + apiKey)
   */
  private generateCallbackSignature(amount: string, merchantOrderId: string): string {
    const data = `${this.merchantCode}${amount}${merchantOrderId}${this.apiKey}`
    return crypto.createHash('md5').update(data).digest('hex')
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.isActive || !this.merchantCode || !this.apiKey) {
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        error: 'Duitku gateway is not configured'
      }
    }

    try {
      // Extract Duitku payment method code (remove 'duitku_' prefix)
      const duitkuPaymentMethod = request.paymentMethodCode.replace(/^duitku_/, '');
      
      // Get appropriate expiry period for this payment method
      const expiryPeriod = this.getExpiryPeriod(duitkuPaymentMethod);
      
      // Validate payment amount against method limits
      const amountValidation = validatePaymentAmount(
        duitkuPaymentMethod, 
        request.amount, 
        request.currency
      );
      
      if (!amountValidation.isValid) {
        console.error('[DUITKU] Payment amount validation failed:', amountValidation.error);
        return {
          success: false,
          paymentId: '',
          status: 'failed',
          error: amountValidation.error || 'Payment amount validation failed'
        }
      }
      
      console.log('[DUITKU] Payment amount validation passed:', {
        method: duitkuPaymentMethod,
        amount: request.amount,
        currency: request.currency,
        limits: amountValidation.limits,
        expiryPeriod: expiryPeriod + ' minutes'
      });
      
      // Create unique merchant order ID that can be traced back to our payment
      const merchantOrderId = `CLIVY-${request.transactionId}-${Date.now()}`
      const paymentAmount = Math.round(request.amount)
      const productDetails = `Clivy Services - Transaction ${request.transactionId}`
      
      // Generate signature sesuai dokumentasi: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
      const signature = this.generateTransactionSignature(merchantOrderId, paymentAmount)

      // Split customer name untuk firstName dan lastName
      const nameParts = request.customerInfo.name.trim().split(' ')
      const firstName = nameParts[0] || 'Customer'
      const lastName = nameParts.slice(1).join(' ') || 'Clivy'

      // Prepare request data sesuai dokumentasi Duitku
      const requestData: any = {
        merchantCode: this.merchantCode,
        paymentAmount: paymentAmount,
        paymentMethod: duitkuPaymentMethod, // Use extracted Duitku code
        merchantOrderId: merchantOrderId,
        productDetails: productDetails,
        customerVaName: request.customerInfo.name.substring(0, 20), // Max 20 chars
        email: request.customerInfo.email,
        phoneNumber: request.customerInfo.phone || '',
        callbackUrl: `${process.env.DUITKU_CALLBACK_URL}`,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/public/duitku/return`,
        signature: signature,
        expiryPeriod: expiryPeriod, // Dynamic expiry based on payment method
        customerDetail: {
          firstName: firstName,
          lastName: lastName,
          email: request.customerInfo.email,
          phoneNumber: request.customerInfo.phone || '',
          billingAddress: {
            firstName: firstName,
            lastName: lastName,
            address: "Default Address",
            city: "Jakarta",
            postalCode: "12345",
            phone: request.customerInfo.phone || '',
            countryCode: "ID"
          },
          shippingAddress: {
            firstName: firstName,
            lastName: lastName,
            address: "Default Address", 
            city: "Jakarta",
            postalCode: "12345",
            phone: request.customerInfo.phone || '',
            countryCode: "ID"
          }
        },
        itemDetails: [
          {
            name: productDetails,
            price: paymentAmount,
            quantity: 1
          }
        ]
      }

      // Add special parameters for specific payment methods
      if (duitkuPaymentMethod === 'SL') {
        // Shopee Pay Account Link requires credentialCode
        // Use environment variable or default sandbox credential for testing
        const credentialCode = process.env.DUITKU_SHOPEE_CREDENTIAL_CODE || 
          (this.isProduction ? '' : '7cXXXXX-XXXX-XXXX-9XXX-944XXXXXXX8'); // Default sandbox credential from docs
        
        if (!credentialCode) {
          console.error('[DUITKU] Shopee Pay Account Link (SL) requires credentialCode but DUITKU_SHOPEE_CREDENTIAL_CODE not configured for production');
          return {
            success: false,
            paymentId: '',
            status: 'failed',
            error: 'Shopee Pay Account Link is not available. Please contact administrator to configure DUITKU_SHOPEE_CREDENTIAL_CODE.'
          }
        }

        console.log('[DUITKU] Adding accountLink for Shopee Pay (SL), using', this.isProduction ? 'production' : 'sandbox', 'credential');
        requestData.accountLink = {
          credentialCode: credentialCode,
          shopee: {
            useCoin: false,
            promoId: ''
          }
        }
      } else if (duitkuPaymentMethod === 'OL') {
        // OVO Account Link requires credentialCode
        // Use environment variable or default sandbox credential for testing
        const credentialCode = process.env.DUITKU_OVO_CREDENTIAL_CODE ||
          (this.isProduction ? '' : 'A0F22572-4AF1-E111-812C-B01224449936'); // Default sandbox credential from docs
        
        if (!credentialCode) {
          console.error('[DUITKU] OVO Account Link (OL) requires credentialCode but DUITKU_OVO_CREDENTIAL_CODE not configured for production');
          return {
            success: false,
            paymentId: '',
            status: 'failed',
            error: 'OVO Account Link is not available. Please contact administrator to configure DUITKU_OVO_CREDENTIAL_CODE.'
          }
        }

        console.log('[DUITKU] Adding accountLink for OVO (OL), using', this.isProduction ? 'production' : 'sandbox', 'credential');
        requestData.accountLink = {
          credentialCode: credentialCode,
          ovo: {
            paymentDetails: [{
              paymentType: 'CASH',
              amount: paymentAmount.toString()
            }]
          }
        }
      }

      console.log('[DUITKU] Creating payment:', {
        merchantOrderId,
        paymentAmount,
        paymentMethod: duitkuPaymentMethod, // Updated to show extracted code
        email: request.customerInfo.email
      });

      // Log full request for debugging
      console.log('[DUITKU] Request data:', JSON.stringify({
        merchantCode: requestData.merchantCode,
        paymentAmount: requestData.paymentAmount,
        paymentMethod: requestData.paymentMethod,
        merchantOrderId: requestData.merchantOrderId,
        signature: requestData.signature,
        email: requestData.email
      }, null, 2));

      // Endpoint sesuai dokumentasi
      const endpoint = `${this.baseUrl}/v2/inquiry`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const responseData = await response.json()
      
      // Log full response for debugging
      console.log('[DUITKU] Full response:', JSON.stringify(responseData, null, 2));
      console.log('[DUITKU] HTTP status:', response.status);
      
      console.log('[DUITKU] Payment response summary:', {
        statusCode: responseData.statusCode,
        statusMessage: responseData.statusMessage,
        reference: responseData.reference,
        paymentUrl: responseData.paymentUrl
      });

      if (response.ok && responseData.statusCode === '00') {
        // Calculate expiry time based on payment method
        const expiresAt = this.calculateExpiryTime(duitkuPaymentMethod, false)
        
        return {
          success: true,
          paymentId: merchantOrderId,
          status: 'pending',
          externalId: responseData.reference,
          paymentUrl: responseData.paymentUrl,
          expiresAt: expiresAt,
          gatewayResponse: {
            merchantCode: responseData.merchantCode,
            reference: responseData.reference,
            paymentUrl: responseData.paymentUrl,
            vaNumber: responseData.vaNumber,
            qrString: responseData.qrString,
            amount: responseData.amount,
            statusCode: responseData.statusCode,
            statusMessage: responseData.statusMessage
          }
        }
      } else {
        // Enhanced error handling
        const errorMessage = responseData.statusMessage || responseData.responseMessage || responseData.Message || 'Payment creation failed'
        const errorDetails = {
          statusCode: responseData.statusCode,
          statusMessage: responseData.statusMessage,
          responseMessage: responseData.responseMessage,
          message: responseData.Message,
          merchantCode: responseData.merchantCode,
          httpStatus: response.status
        }
        
        console.error('[DUITKU] Payment creation failed:', errorDetails);
        
        // Special handling for payment limit errors
        if (errorMessage.includes('Maximum Payment exceeded') || errorMessage.includes('maximum')) {
          return {
            success: false,
            paymentId: '',
            status: 'failed',
            error: `Payment amount exceeds the maximum limit for this payment method. Please choose a different payment method or reduce your order amount.`
          }
        }
        // General handling for any "Failed to generate" errors from Duitku
        if (errorMessage.includes('Failed to generate') && response.status >= 500) {
          return {
            success: false,
            paymentId: '',
            status: 'failed',
            error: `This payment method is temporarily unavailable due to technical issues. Please choose a different payment method such as Bank Transfer or Virtual Account options.`
          }
        }
        
        return {
          success: false,
          paymentId: '',
          status: 'failed',
          error: `Duitku Error: ${errorMessage} (Code: ${responseData.statusCode || response.status})`
        }
      }

    } catch (error) {
      console.error('[DUITKU] Payment error:', error)
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment creation failed'
      }
    }
  }

  /**
   * Validate callback signature from Duitku
   * Signature: MD5(merchantCode + amount + merchantOrderId + apiKey)
   */
  async validateCallback(callbackData: any): Promise<boolean> {
    try {
      const { merchantCode, amount, merchantOrderId, signature } = callbackData
      
      if (!merchantCode || !amount || !merchantOrderId || !signature) {
        console.error('[DUITKU] Missing callback data for signature validation')
        return false
      }

      // Generate expected signature
      const signatureString = `${merchantCode}${amount}${merchantOrderId}${this.apiKey}`
      const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex')
      
      console.log('[DUITKU] Signature validation:', {
        signatureString: `${merchantCode}${amount}${merchantOrderId}***`,
        expected: expectedSignature,
        received: signature,
        valid: expectedSignature === signature
      })

      return expectedSignature === signature
    } catch (error) {
      console.error('[DUITKU] Callback validation error:', error)
      return false
    }
  }

  async checkPaymentStatus(externalId: string): Promise<PaymentResponse> {
    try {
      // Generate signature untuk status check
      const signature = this.generateStatusSignature(externalId)

      const requestData = {
        merchantCode: this.merchantCode,
        merchantOrderId: externalId,
        signature: signature
      }

      // Endpoint sesuai dokumentasi
      const endpoint = `${this.baseUrl}/transactionStatus`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const responseData = await response.json()
      console.log('Duitku status response:', responseData)

      if (response.ok) {
        const status = this.mapDuitkuStatus(responseData.statusCode)
        
        return {
          success: true,
          paymentId: responseData.merchantOrderId,
          status: status as 'pending' | 'paid' | 'failed' | 'expired',
          externalId: responseData.reference,
          gatewayResponse: responseData
        }
      } else {
        return {
          success: false,
          paymentId: '',
          status: 'failed',
          error: responseData.statusMessage || 'Status check failed'
        }
      }

    } catch (error) {
      console.error('Duitku status check error:', error)
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Status check failed'
      }
    }
  }

  async processCallback(data: any): Promise<PaymentCallback> {
    try {
      const { merchantCode, amount, merchantOrderId, signature } = data
      
      // Validate signature sesuai dokumentasi
      const expectedSignature = this.generateCallbackSignature(amount.toString(), merchantOrderId)

      if (signature !== expectedSignature) {
        console.error('Invalid Duitku callback signature')
        console.error('Expected:', expectedSignature)
        console.error('Received:', signature)
        throw new Error('Invalid signature')
      }

      const status = this.mapDuitkuStatus(data.resultCode)

      return {
        gatewayProvider: 'duitku',
        externalId: data.reference,
        transactionId: merchantOrderId,
        status: status as 'pending' | 'paid' | 'failed' | 'expired',
        amount: parseFloat(amount),
        paymentDate: new Date(),
        rawData: data
      }

    } catch (error) {
      console.error('Duitku callback error:', error)
      throw error
    }
  }

  async getAvailablePaymentMethods(): Promise<PaymentMethodConfig[]> {
    try {
      const paymentAmount = 10000 // Minimum amount untuk testing
      const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ') // Format: YYYY-MM-DD HH:mm:ss
      
      // Generate signature sesuai dokumentasi
      const signature = this.generatePaymentMethodSignature(paymentAmount, datetime)

      const requestData = {
        merchantcode: this.merchantCode,
        amount: paymentAmount,
        datetime: datetime,
        signature: signature
      }

      // Endpoint sesuai dokumentasi
      const endpoint = `${this.baseUrl}/paymentmethod/getpaymentmethod`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const responseData = await response.json()
      // console.log('Duitku payment methods response:', responseData)

      if (response.ok && responseData.responseCode === '00' && responseData.paymentFee && Array.isArray(responseData.paymentFee)) {
        return responseData.paymentFee.map((method: any) => ({
          code: method.paymentMethod,
          name: method.paymentName,
          type: this.getMethodType(method.paymentMethod),
          currency: this.getMethodCurrency(method.paymentMethod),
          gatewayCode: method.paymentMethod,
          image: method.paymentImage,
          isActive: true
        }))
      }

      return []

    } catch (error) {
      console.error('Error getting Duitku payment methods:', error)
      return []
    }
  }

  async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.merchantCode || !this.apiKey || !this.baseUrl) {
        return false
      }

      // Test dengan get payment methods
      const methods = await this.getAvailablePaymentMethods()
      return methods.length > 0

    } catch (error) {
      console.error('Duitku configuration validation failed:', error)
      return false
    }
  }

  // Helper methods for sync dan create default
  async syncPaymentMethods(): Promise<boolean> {
    try {
      const methods = await this.getAvailablePaymentMethods()
      
      for (const method of methods) {
        const mapping = this.getPaymentMethodMapping(method.code)
        
        await prisma.paymentMethod.upsert({
          where: {
            code: `duitku_${method.code}`
          },
          update: {
            name: mapping.name,
            description: method.name,
            type: mapping.type,
            currency: this.getMethodCurrency(method.code),
            isActive: true,
            isGatewayMethod: true
          },
          create: {
            code: `duitku_${method.code}`,
            name: mapping.name,
            description: method.name,
            type: mapping.type,
            currency: this.getMethodCurrency(method.code),
            gatewayProvider: 'duitku',
            gatewayCode: method.code,
            isGatewayMethod: true,
            isActive: true
          }
        })
      }

      console.log(`Synced ${methods.length} Duitku payment methods`)
      return true

    } catch (error) {
      console.error('Error syncing Duitku payment methods:', error)
      return false
    }
  }

  async createDefaultPaymentMethods(): Promise<boolean> {
    try {
      const defaultMethods = this.getDefaultPaymentMethods()
      
      for (const [code, methodInfo] of Object.entries(defaultMethods)) {
        // Generate payment instructions for retail methods
        let paymentInstructions = null;
        if (code === 'IR') {
          paymentInstructions = `Instruksi Pembayaran Indomaret:

1. Catat dan simpan Kode Pembayaran Anda
2. Datang ke Gerai retail Indomaret / Ceriamart / Lion Super Indo
3. Informasikan kepada kasir akan melakukan "Pembayaran Clivy"
4. Apabila kasir mengatakan tidak melayani pembayaran untuk "Clivy", Anda dapat menginformasikan bahwa pembayaran ini merupakan Payment Point pada Kategori "e-Commerce"
5. Tunjukkan dan berikan Kode Pembayaran ke Kasir
6. Lakukan pembayaran sesuai nominal yang diinformasikan dan tunggu proses selesai
7. Minta dan simpan struk sebagai bukti pembayaran
8. Pembayaran Anda akan langsung terdeteksi secara otomatis`;
        } else if (code === 'FT') {
          paymentInstructions = `Instruksi Pembayaran Alfamart Group:

1. Catat dan simpan Kode Pembayaran Anda
2. Datang ke Gerai retail (Alfamart, Kantor Pos, Pegadaian, & Dan-Dan)
3. Informasikan kepada kasir akan melakukan "Pembayaran Telkom/Indihome/Finpay"
4. Jika kasir menanyakan jenis pembayaran Telkom, pilih pembayaran untuk "Telepon Rumah" atau "Indihome atau Finpay"
5. Tunjukkan dan berikan Kode Pembayaran ke Kasir
6. Lakukan pembayaran sesuai nominal yang diinformasikan dan tunggu proses selesai
7. Minta dan simpan struk sebagai bukti pembayaran
8. Pembayaran Anda akan langsung terdeteksi secara otomatis`;
        }

        await prisma.paymentMethod.upsert({
          where: {
            code: `duitku_${code}`
          },
          update: {
            name: methodInfo.name,
            type: methodInfo.type,
            currency: this.getMethodCurrency(code),
            gatewayImageUrl: methodInfo.image || null,
            isActive: true,
            // Only update payment instructions if we have new ones
            ...(paymentInstructions && {
              paymentInstructions: paymentInstructions,
              instructionType: 'text'
            })
          },
          create: {
            code: `duitku_${code}`,
            name: methodInfo.name,
            description: methodInfo.name_id,
            type: methodInfo.type,
            currency: this.getMethodCurrency(code),
            gatewayProvider: 'duitku',
            gatewayCode: code,
            gatewayImageUrl: methodInfo.image || null,
            isGatewayMethod: true,
            isActive: true,
            paymentInstructions: paymentInstructions,
            instructionType: paymentInstructions ? 'text' : null
          }
        })
      }

      console.log(`Created ${Object.keys(defaultMethods).length} default Duitku payment methods`)
      return true

    } catch (error) {
      console.error('Error creating default Duitku payment methods:', error)
      return false
    }
  }

  private mapDuitkuStatus(statusCode: string): string {
    // Sesuai dokumentasi Duitku
    const statusMapping: { [key: string]: string } = {
      '00': 'paid',      // Success
      '01': 'pending',   // Pending/Failed (dalam docs bisa keduanya)
      '02': 'failed'     // Canceled
    }
    
    return statusMapping[statusCode] || 'failed'
  }

  private getMethodType(paymentMethod: string): string {
    // Sesuai dengan dokumentasi Duitku - Metode Pembayaran
    const typeMapping: { [key: string]: string } = {
      // Credit Card
      'VC': 'credit_card',
      
      // Virtual Account
      'BC': 'virtual_account',   // BCA Virtual Account
      'M2': 'virtual_account',   // Mandiri Virtual Account
      'VA': 'virtual_account',   // Maybank Virtual Account
      'I1': 'virtual_account',   // BNI Virtual Account
      'B1': 'virtual_account',   // CIMB Niaga Virtual Account
      'BT': 'virtual_account',   // Permata Bank Virtual Account
      'A1': 'virtual_account',   // ATM Bersama
      'AG': 'virtual_account',   // Bank Artha Graha
      'NC': 'virtual_account',   // Bank Neo Commerce/BNC
      'BR': 'virtual_account',   // BRIVA
      'S1': 'virtual_account',   // Bank Sahabat Sampoerna
      'DM': 'virtual_account',   // Danamon Virtual Account
      'BV': 'virtual_account',   // BSI Virtual Account
      
      // Retail
      'FT': 'retail',            // Pegadaian/ALFA/Pos
      'IR': 'retail',            // Indomaret
      
      // E-Wallet
      'OV': 'e_wallet',          // OVO
      'SA': 'e_wallet',          // Shopee Pay Apps
      'LF': 'e_wallet',          // LinkAja Apps (Fixed Fee)
      'LA': 'e_wallet',          // LinkAja Apps (Percentage Fee)
      'DA': 'e_wallet',          // DANA
      'SL': 'e_wallet',          // Shopee Pay Account Link
      'OL': 'e_wallet',          // OVO Account Link
      'JP': 'e_wallet',          // Jenius Pay
      
      // QRIS
      'SP': 'qris',              // Shopee Pay
      'NQ': 'qris',              // Nobu
      'GQ': 'qris',              // Gudang Voucher
      'SQ': 'qris',              // Nusapay
      
      // Kredit/Paylater
      'DN': 'paylater',          // Indodana Paylater
      'AT': 'paylater'           // ATOME
    }
    
    return typeMapping[paymentMethod] || 'other'
  }

  private getMethodCurrency(paymentMethod: string): string {
    // Credit card support multi currency
    if (paymentMethod === 'VC') {
      return 'any' // Support all currencies for credit card
    }
    
    // All other Indonesian payment methods use IDR
    return 'idr'
  }

  private getPaymentMethodMapping(code: string) {
    // Mapping sesuai dokumentasi Duitku dengan image URLs
    const mapping: { [key: string]: any } = {
      // Credit Card
      'VC': { 
        name: 'Credit Card (Visa/Mastercard/JCB)', 
        name_id: 'Kartu Kredit', 
        type: 'credit_card',
        image: 'https://duitku.com/assets/img/logo_payment/VC.png'
      },
      
      // Virtual Account
      'BC': { 
        name: 'BCA Virtual Account', 
        name_id: 'Virtual Account BCA', 
        type: 'virtual_account',
        image: 'https://duitku.com/assets/img/logo_payment/BC.png'
      },
      'M2': { 
        name: 'Mandiri Virtual Account', 
        name_id: 'Virtual Account Mandiri', 
        type: 'virtual_account',
        image: 'https://duitku.com/assets/img/logo_payment/M2.png'
      },
      'VA': { 
        name: 'Maybank Virtual Account', 
        name_id: 'Virtual Account Maybank', 
        type: 'virtual_account',
        image: 'https://duitku.com/assets/img/logo_payment/VA.png'
      },
      'I1': { 
        name: 'BNI Virtual Account', 
        name_id: 'Virtual Account BNI', 
        type: 'virtual_account',
        image: 'https://duitku.com/assets/img/logo_payment/I1.png'
      },
      'B1': { 
        name: 'CIMB Niaga Virtual Account', 
        name_id: 'Virtual Account CIMB Niaga', 
        type: 'virtual_account',
        image: 'https://duitku.com/assets/img/logo_payment/B1.png'
      },
      'BT': { 
        name: 'Permata Bank Virtual Account', 
        name_id: 'Virtual Account Permata', 
        type: 'virtual_account',
        image: 'https://duitku.com/assets/img/logo_payment/BT.png'
      },
      'BV': { 
        name: 'BSI Virtual Account', 
        name_id: 'Virtual Account BSI', 
        type: 'virtual_account',
        image: 'https://duitku.com/assets/img/logo_payment/BV.png'
      },
      'A1': { 
        name: 'ATM Bersama', 
        name_id: 'ATM Bersama', 
        type: 'virtual_account',
        image: 'https://duitku.com/assets/img/logo_payment/A1.png'
      },
      
      // Retail
      'IR': { 
        name: 'Indomaret', 
        name_id: 'Indomaret', 
        type: 'retail',
        image: 'https://duitku.com/assets/img/logo_payment/IR.png'
      },
      'FT': { 
        name: 'Alfamart Group', 
        name_id: 'Alfamart Group', 
        type: 'retail',
        image: 'https://duitku.com/assets/img/logo_payment/FT.png'
      },
      
      // E-Wallet
      'OV': { 
        name: 'OVO', 
        name_id: 'OVO', 
        type: 'e_wallet',
        image: 'https://duitku.com/assets/img/logo_payment/OV.png'
      },
      'SA': { 
        name: 'Shopee Pay Apps', 
        name_id: 'ShopeePay Apps', 
        type: 'e_wallet',
        image: 'https://duitku.com/assets/img/logo_payment/SA.png'
      },
      'LF': { 
        name: 'LinkAja', 
        name_id: 'LinkAja', 
        type: 'e_wallet',
        image: 'https://duitku.com/assets/img/logo_payment/LF.png'
      },
      'DA': { 
        name: 'DANA', 
        name_id: 'DANA', 
        type: 'e_wallet',
        image: 'https://duitku.com/assets/img/logo_payment/DA.png'
      },
      
      // QRIS
      'SP': { 
        name: 'Shopee Pay QRIS', 
        name_id: 'ShopeePay QRIS', 
        type: 'qris',
        image: 'https://duitku.com/assets/img/logo_payment/SP.png'
      },
      'NQ': { 
        name: 'Nobu QRIS', 
        name_id: 'Nobu QRIS', 
        type: 'qris',
        image: 'https://duitku.com/assets/img/logo_payment/NQ.png'
      },
      
      // Paylater
      'DN': { name: 'Indodana Paylater', name_id: 'Indodana Paylater', type: 'paylater' },
      'AT': { name: 'ATOME', name_id: 'ATOME', type: 'paylater' }
    }

    return mapping[code] || { 
      name: code, 
      name_id: code, 
      type: 'other',
      image: null 
    }
  }

  private getDefaultPaymentMethods() {
    // Method populer dari dokumentasi Duitku dengan image URLs yang sebenarnya
    return {
      'VC': { 
        name: 'CREDIT CARD', 
        name_id: 'Kartu Kredit', 
        type: 'credit_card',
        image: 'https://images.duitku.com/hotlink-ok/VC.PNG'
      },
      'BC': { 
        name: 'BCA VA', 
        name_id: 'Virtual Account BCA', 
        type: 'virtual_account',
        image: 'https://images.duitku.com/hotlink-ok/BCA.SVG'
      },
      'M2': { 
        name: 'MANDIRI VA H2H', 
        name_id: 'Virtual Account Mandiri', 
        type: 'virtual_account',
        image: 'https://images.duitku.com/hotlink-ok/MV.PNG'
      },
      'VA': { 
        name: 'MAYBANK VA', 
        name_id: 'Virtual Account Maybank', 
        type: 'virtual_account',
        image: 'https://images.duitku.com/hotlink-ok/VA.PNG'
      },
      'I1': { 
        name: 'BNI VA', 
        name_id: 'Virtual Account BNI', 
        type: 'virtual_account',
        image: 'https://images.duitku.com/hotlink-ok/I1.PNG'
      },
      'B1': { 
        name: 'CIMB NIAGA VA', 
        name_id: 'Virtual Account CIMB Niaga', 
        type: 'virtual_account',
        image: 'https://images.duitku.com/hotlink-ok/B1.PNG'
      },
      'BT': { 
        name: 'PERMATA VA', 
        name_id: 'Virtual Account Permata', 
        type: 'virtual_account',
        image: 'https://images.duitku.com/hotlink-ok/PERMATA.PNG'
      },
      'BV': { 
        name: 'BSI VA', 
        name_id: 'Virtual Account BSI', 
        type: 'virtual_account',
        image: 'https://images.duitku.com/hotlink-ok/BSI.PNG'
      },
      'A1': { 
        name: 'ATM BERSAMA VA', 
        name_id: 'ATM Bersama', 
        type: 'virtual_account',
        image: 'https://images.duitku.com/hotlink-ok/A1.PNG'
      },
      'IR': { 
        name: 'INDOMARET', 
        name_id: 'Indomaret', 
        type: 'retail',
        image: 'https://images.duitku.com/hotlink-ok/IR.PNG'
      },
      'FT': { 
        name: 'ALFAMART GROUP', 
        name_id: 'Alfamart Group', 
        type: 'retail',
        image: 'https://images.duitku.com/hotlink-ok/FT.PNG'
      },
      'SA': { 
        name: 'SHOPEEPAY APP', 
        name_id: 'ShopeePay Apps', 
        type: 'e_wallet',
        image: 'https://images.duitku.com/hotlink-ok/SHOPEEPAY.PNG'
      },
      'NQ': { 
        name: 'NOBU QRIS', 
        name_id: 'Nobu QRIS', 
        type: 'qris',
        image: 'https://images.duitku.com/hotlink-ok/NQ.PNG'
      }
    }
  }
}
