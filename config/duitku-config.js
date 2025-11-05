/**
 * Duitku Payment Gateway Configuration
 * Configuration sesuai dengan dokumentasi Duitku NPM
 */

// Environment variables validation
const requiredEnvVars = {
  DUITKU_BASE_URL: process.env.DUITKU_BASE_URL,
  DUITKU_API_KEY: process.env.DUITKU_API_KEY,
  DUITKU_MERCHANT_CODE: process.env.DUITKU_MERCHANT_CODE
};

// Validate required environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required Duitku environment variables: ${missingVars.join(', ')}`);
}

// Duitku configuration sesuai dokumentasi NPM
const duitkuConfig = {
  merchantCode: requiredEnvVars.DUITKU_MERCHANT_CODE,
  apiKey: requiredEnvVars.DUITKU_API_KEY,
  passport: requiredEnvVars.DUITKU_BASE_URL.includes('prod'), // true for production
  callbackUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/public/duitku/callback',
  returnUrl: process.env.NEXT_PUBLIC_APP_URL + '/payment/result',
  accountLinkReturnUrl: process.env.NEXT_PUBLIC_APP_URL + '/dashboard/user',
  expiryPeriod: 1440 // 24 hours in minutes
};

/**
 * Payment method mapping untuk Duitku berdasarkan dokumentasi
 */
const PaymentMethodMapping = {
  // Virtual Accounts
  'M2': {
    name: 'Mandiri Virtual Account',
    name_id: 'Virtual Account Mandiri',
    type: 'virtual_account',
    category: 'bank_transfer'
  },
  'VA': {
    name: 'Maybank Virtual Account',
    name_id: 'Virtual Account Maybank',
    type: 'virtual_account',
    category: 'bank_transfer'
  },
  'BV': {
    name: 'BCA Virtual Account',
    name_id: 'Virtual Account BCA',
    type: 'virtual_account',
    category: 'bank_transfer'
  },
  'I1': {
    name: 'BNI Virtual Account',
    name_id: 'Virtual Account BNI',
    type: 'virtual_account',
    category: 'bank_transfer'
  },
  'B1': {
    name: 'BRI Virtual Account',
    name_id: 'Virtual Account BRI',
    type: 'virtual_account',
    category: 'bank_transfer'
  },
  'A1': {
    name: 'ATM Bersama',
    name_id: 'ATM Bersama',
    type: 'atm',
    category: 'atm_payment'
  },
  
  // E-Wallets
  'DA': {
    name: 'DANA',
    name_id: 'DANA',
    type: 'e_wallet',
    category: 'digital_wallet'
  },
  'OV': {
    name: 'OVO',
    name_id: 'OVO',
    type: 'e_wallet',
    category: 'digital_wallet'
  },
  'SA': {
    name: 'ShopeePay',
    name_id: 'ShopeePay',
    type: 'e_wallet',
    category: 'digital_wallet'
  },
  'LF': {
    name: 'LinkAja',
    name_id: 'LinkAja',
    type: 'e_wallet',
    category: 'digital_wallet'
  },
  
  // Credit Cards
  'VC': {
    name: 'Credit Card (Visa/Mastercard)',
    name_id: 'Kartu Kredit (Visa/Mastercard)',
    type: 'credit_card',
    category: 'card'
  },
  
  // Retail
  'IR': {
    name: 'Indomaret',
    name_id: 'Indomaret',
    type: 'retail',
    category: 'retail_payment'
  },
  'AL': {
    name: 'Alfamart',
    name_id: 'Alfamart',
    type: 'retail',
    category: 'retail_payment'
  },
  
  // QRIS
  'S1': {
    name: 'QRIS',
    name_id: 'QRIS',
    type: 'qris',
    category: 'digital_payment'
  }
};

// Status mapping Duitku ke internal system
const StatusMapping = {
  '00': 'paid',      // Success
  '01': 'pending',   // Pending
  '02': 'failed',    // Failed
  '03': 'expired',   // Expired
  '04': 'cancelled'  // Cancelled
};

/**
 * Utility functions untuk Duitku operations
 */
const DuitkuUtils = {
  /**
   * Format amount untuk Duitku (harus integer)
   */
  formatAmount: (amount) => {
    return Math.round(amount);
  },
  
  /**
   * Generate payment reference
   */
  generatePaymentReference: (transactionId) => {
    const timestamp = Date.now();
    return `GENFITY-${transactionId}-${timestamp}`;
  },
  
  /**
   * Format payment method untuk database storage
   */
  formatPaymentMethod: (duitkuMethod) => {
    const mapping = PaymentMethodMapping[duitkuMethod.paymentMethod] || {
      name: duitkuMethod.paymentName || duitkuMethod.paymentMethod,
      name_id: duitkuMethod.paymentName || duitkuMethod.paymentMethod,
      type: 'other',
      category: 'other'
    };
    
    return {
      gatewayProvider: 'duitku',
      gatewayCode: duitkuMethod.paymentMethod,
      name: mapping.name,
      name_id: mapping.name_id,
      type: mapping.type,
      category: mapping.category,
      isGatewayMethod: true,
      requiresManualApproval: false,
      isActive: true,
      metadata: {
        duitkuData: duitkuMethod,
        totalFee: duitkuMethod.totalFee || 0,
        paymentName: duitkuMethod.paymentName,
        paymentImage: duitkuMethod.paymentImage
      }
    };
  }
};

module.exports = {
  duitkuConfig,
  PaymentMethodMapping,
  StatusMapping,
  DuitkuUtils
};
