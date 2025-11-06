// Customer API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | any[];
  message?: string;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: PaginationInfo;
}

// Payment Types
export interface CustomerPayment {
  id: string;
  amount: number;
  method: string;
  status: 'pending' | 'paid' | 'failed';
  paymentDate?: string;
}

export interface PaymentResponse {
  transaction_id: string;
  payment_id: string;
  method: string;
  amount: number;
  status: string;
  payment_url?: string;
  token?: string;
  redirect_url?: string;
  external_id?: string;
  invoice_id?: string;
  bank_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  payment_code?: string;
  instructions?: string;
}

export interface PaymentStatusResponse extends CustomerPayment {
  transaction: {
    id: string;
    status: string;
    transactionDate: string;
  };
  gateway_info: {
    gateway_status?: string;
    fraud_status?: string;
    transaction_time?: string;
    external_id?: string;
    updated?: string;
    verification_status?: string;
    last_checked?: string;
  };
}

// WhatsApp Service Types (IDR only)
export interface CustomerWhatsAppPackage {
  id: string;
  name: string;
  description?: string;
  priceMonth: number;  // IDR only
  priceYear: number;   // IDR only
  maxSession: number;
  createdAt: string;
  yearlyDiscount: number;
  recommended: boolean;
  features: string[];
}

export interface CustomerWhatsAppService {
  id: string;
  expiredAt: string;
  createdAt: string;
  package: {
    id: string;
    name: string;
    description?: string;
    maxSession: number;
  };
  status: 'active' | 'expired';
  daysRemaining: number;
  isExpiringSoon: boolean;
}

export interface CustomerWhatsAppTransaction {
  id: string;
  duration: 'month' | 'year';
  price: number;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
  package: {
    id: string;
    name: string;
    description?: string;
    maxSession: number;
  };
  durationText: string;
  statusText: string;
  canRetryPayment: boolean;
}

export interface CreateWhatsAppSubscriptionRequest {
  packageId: string;
  duration: 'month' | 'year';
}

// Profile Types
export interface CustomerProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
  emailVerified?: string;
  phoneVerified?: string;
  role: string;
  stats: {
    totalTransactions: number;
    totalWhatsappTransactions: number;
    activeWhatsappServices: number;
    totalWhatsappServices: number;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

// API Query Parameters
export interface WhatsAppServiceQueryParams {
  status?: 'active' | 'expired' | 'all';
}

export interface WhatsAppTransactionQueryParams {
  status?: string;
  limit?: string;
  offset?: string;
}
