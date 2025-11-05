// Types for My Package components
export interface MyPackage {
  id: string;
  transactionId: string;
  packageId: string;
  quantity: number;
  status: string; // awaiting_delivery, in_progress, delivered
  deliveredAt?: string;
  websiteUrl?: string;
  driveUrl?: string;
  textDescription?: string;
  domainName?: string;
  domainExpiredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  package: {
    id: string;
    name_en: string;
    name_id: string;
    description_en: string;
    description_id: string;
    price_idr: number;
    price_usd: number;
    image?: string;
    features?: {
      id: string;
      name_en: string;
      name_id: string;
      included: boolean;
    }[];
    category?: {
      id: string;
      name_en: string;
      name_id: string;
    };
    subcategory?: {
      id: string;
      name_en: string;
      name_id: string;
    };
  };
  transaction: {
    id: string;
    amount: number;
    finalAmount?: number;
    currency: string;
    status: string;
    transactionDate: string;
    payment?: {
      id: string;
      method: string;
      status: string;
      paymentDate?: string;
    };
  };
}

export interface MyPackageStats {
  total: number;
  awaiting: number;
  inProgress: number;
  delivered: number;
  domainsExpiringSoon: number;
  totalValue: number;
}

export interface PackageFilters {
  search: string;
  status: string;
  dateRange: string;
  sortBy: "newest" | "oldest" | "value" | "status";
}
