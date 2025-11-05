/**
 * Payment method limits configuration for various gateways
 * These limits are based on payment provider restrictions
 */

export interface PaymentLimits {
  minAmount: number;
  maxAmount: number;
  currency: 'idr' | 'usd' | 'any';
  notes?: string;
}

/**
 * Manual bank transfer limits - higher than gateway methods
 */
export const MANUAL_BANK_TRANSFER_LIMITS: Record<'idr' | 'usd', PaymentLimits> = {
  idr: {
    minAmount: 0, // No minimum
    maxAmount: 100000000, // 100 million IDR
    currency: 'idr',
    notes: 'Manual bank transfer - higher limits'
  },
  usd: {
    minAmount: 0, // No minimum  
    maxAmount: 6000, // 6000 USD
    currency: 'usd',
    notes: 'Manual bank transfer - higher limits'
  }
};

/**
 * Duitku payment method limits
 * Based on real-world testing and provider documentation
 */
export const DUITKU_PAYMENT_LIMITS: Record<string, PaymentLimits> = {
  // Credit Card
  'VC': {
    minAmount: 10000,
    maxAmount: 500000000, // 500M IDR
    currency: 'any',
    notes: 'Credit card supports high amounts'
  },

  // Virtual Account - Generally support higher amounts
  'BC': {
    minAmount: 10000,
    maxAmount: 50000000, // 50M IDR
    currency: 'idr',
    notes: 'BCA VA supports high amounts'
  },
  'M2': {
    minAmount: 10000,
    maxAmount: 50000000,
    currency: 'idr'
  },
  'VA': {
    minAmount: 10000,
    maxAmount: 50000000,
    currency: 'idr'
  },
  'I1': {
    minAmount: 10000,
    maxAmount: 50000000,
    currency: 'idr'
  },
  'B1': {
    minAmount: 10000,
    maxAmount: 50000000,
    currency: 'idr'
  },
  'BT': {
    minAmount: 10000,
    maxAmount: 50000000,
    currency: 'idr'
  },
  'BV': {
    minAmount: 10000,
    maxAmount: 50000000,
    currency: 'idr'
  },
  'A1': {
    minAmount: 10000,
    maxAmount: 50000000,
    currency: 'idr'
  },
  'AG': {
    minAmount: 10000,
    maxAmount: 50000000,
    currency: 'idr'
  },
  'NC': {
    minAmount: 10000,
    maxAmount: 50000000,
    currency: 'idr'
  },
  'BR': {
    minAmount: 10000,
    maxAmount: 50000000,
    currency: 'idr'
  },

  // Retail - Lower limits due to cash handling restrictions
  'IR': {
    minAmount: 10000,
    maxAmount: 5000000, // 5M IDR (~$333 USD) - Indomaret limit
    currency: 'idr',
    notes: 'Indomaret has cash handling limits'
  },
  'FT': {
    minAmount: 10000,
    maxAmount: 2500000, // 2.5M IDR - Updated based on actual Duitku limits
    currency: 'idr',
    notes: 'Retail outlets have cash handling limits - reduced from 5M to 2.5M based on Duitku feedback'
  },

  // E-Wallet - Medium limits
  'OV': {
    minAmount: 1,
    maxAmount: 2000000, // 2M IDR
    currency: 'idr'
  },
  'SA': {
    minAmount: 1,
    maxAmount: 2000000,
    currency: 'idr'
  },
  'LF': {
    minAmount: 1,
    maxAmount: 2000000,
    currency: 'idr'
  },
  'LA': {
    minAmount: 1,
    maxAmount: 2000000,
    currency: 'idr'
  },
  'DA': {
    minAmount: 1,
    maxAmount: 2000000,
    currency: 'idr'
  },
  'SL': {
    minAmount: 1,
    maxAmount: 2000000,
    currency: 'idr'
  },
  'OL': {
    minAmount: 1,
    maxAmount: 2000000,
    currency: 'idr'
  },
  'JP': {
    minAmount: 1,
    maxAmount: 2000000,
    currency: 'idr'
  },

  // QRIS - Medium limits
  'SP': {
    minAmount: 1,
    maxAmount: 10000000,
    currency: 'idr'
  },
  'NQ': {
    minAmount: 1,
    maxAmount: 10000000,
    currency: 'idr'
  },
  'GQ': {
    minAmount: 1,
    maxAmount: 10000000,
    currency: 'idr'
  },
  'SQ': {
    minAmount: 1,
    maxAmount: 10000000,
    currency: 'idr'
  },

  // Paylater - Medium limits
  'DN': {
    minAmount: 10000,
    maxAmount: 25000000, // 25M IDR
    currency: 'idr'
  },
  'AT': {
    minAmount: 10000,
    maxAmount: 25000000,
    currency: 'idr'
  }
};

/**
 * Get payment limits for a specific payment method
 */
export function getPaymentLimits(paymentMethodCode: string): PaymentLimits | null {
  // Remove gateway prefix if present
  const cleanCode = paymentMethodCode.replace(/^duitku_/, '');
  return DUITKU_PAYMENT_LIMITS[cleanCode] || null;
}

/**
 * Validate payment amount against method limits
 */
export function validatePaymentAmount(
  paymentMethodCode: string, 
  amount: number, 
  currency: 'idr' | 'usd' = 'idr'
): { isValid: boolean; error?: string; limits?: PaymentLimits } {
  const limits = getPaymentLimits(paymentMethodCode);
  
  if (!limits) {
    return { 
      isValid: false, 
      error: `Payment limits not configured for method: ${paymentMethodCode}` 
    };
  }

  // Convert amount to IDR if needed for comparison
  let amountInIDR = amount;
  if (currency === 'usd' && limits.currency === 'idr') {
    amountInIDR = amount * 15000; // Rough conversion for validation
  }

  if (amountInIDR < limits.minAmount) {
    const minFormatted = currency === 'idr' 
      ? `Rp ${limits.minAmount.toLocaleString('id-ID')}`
      : `$${(limits.minAmount / 15000).toFixed(2)}`;
      
    return {
      isValid: false,
      error: `Payment amount too low. Minimum: ${minFormatted}`,
      limits
    };
  }

  if (amountInIDR > limits.maxAmount) {
    const maxFormatted = currency === 'idr' 
      ? `Rp ${limits.maxAmount.toLocaleString('id-ID')}`
      : `$${(limits.maxAmount / 15000).toFixed(2)}`;
      
    return {
      isValid: false,
      error: `Payment amount exceeds maximum limit. Maximum: ${maxFormatted}${limits.notes ? ` (${limits.notes})` : ''}`,
      limits
    };
  }

  return { isValid: true, limits };
}

/**
 * Get formatted limits display for frontend
 */
export function getFormattedLimits(paymentMethodCode: string, currency: 'idr' | 'usd' = 'idr'): string | null {
  const limits = getPaymentLimits(paymentMethodCode);
  if (!limits) return null;

  if (currency === 'idr') {
    const min = `Rp ${limits.minAmount.toLocaleString('id-ID')}`;
    const max = `Rp ${limits.maxAmount.toLocaleString('id-ID')}`;
    return `${min} - ${max}`;
  } else {
    const min = `$${(limits.minAmount / 15000).toFixed(2)}`;
    const max = `$${(limits.maxAmount / 15000).toFixed(2)}`;
    return `${min} - ${max}`;
  }
}

/**
 * Universal payment validation for any payment method type
 * Supports both manual bank transfer and gateway methods
 */
export function isPaymentAmountValid(
  paymentMethodCode: string,
  isGatewayMethod: boolean,
  amount: number,
  currency: 'idr' | 'usd' = 'idr'
): boolean {
  // For manual bank transfer methods
  if (!isGatewayMethod) {
    const limits = MANUAL_BANK_TRANSFER_LIMITS[currency];
    return amount >= limits.minAmount && amount <= limits.maxAmount;
  }

  // For gateway methods (Duitku)
  const validation = validatePaymentAmount(paymentMethodCode, amount, currency);
  return validation.isValid;
}

/**
 * Get limits for any payment method type
 */
export function getUniversalPaymentLimits(
  paymentMethodCode: string,
  isGatewayMethod: boolean,
  currency: 'idr' | 'usd' = 'idr'
): PaymentLimits | null {
  // For manual bank transfer methods
  if (!isGatewayMethod) {
    return MANUAL_BANK_TRANSFER_LIMITS[currency];
  }

  // For gateway methods (Duitku)
  return getPaymentLimits(paymentMethodCode);
}
