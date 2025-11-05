// Types for My Addons components
export interface MyAddon {
  id: string;
  addonId: string;
  transactionId: string;
  customerId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'inprogress' | 'complete';
  driveUrl?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Nested addon information
  addon: {
    id: string;
    name_en: string;
    name_id: string;
    description_en: string;
    description_id: string;
    price: number;
    image?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category: {
      id: string;
      name_en: string;
      name_id: string;
      description_en: string;
      description_id: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
  
  // Nested transaction information
  transaction: {
    id: string;
    status: string;
    paymentMethod: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface MyAddonStats {
  total: number;
  complete: number;
  pending: number;
  inprogress: number;
}

export interface AddonFilters {
  search: string;
  status: 'all' | 'pending' | 'inprogress' | 'complete';
  category: string;
  dateFrom?: Date;
  dateTo?: Date;
  priceMin: string;
  priceMax: string;
  hasDrive: 'all' | 'yes' | 'no';
  sortBy: 'transactionDate' | 'status' | 'totalPrice' | 'deliveredAt';
  sortDirection: 'asc' | 'desc';
}

// For API responses
export interface MyAddonResponse {
  success: boolean;
  data: MyAddon[];
  message?: string;
  error?: string;
}

// For edit form
export interface AddonEditFormData {
  quantity: number;
  websiteUrl: string;
  driveUrl: string;
  textDescription: string;
  domainName: string;
  domainExpiredAt: string;
  status: string;
  notes: string;
}
