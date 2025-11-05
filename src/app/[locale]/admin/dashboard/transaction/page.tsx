"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { SessionManager } from '@/lib/storage';
import { 
  CreditCard, 
  Search,
  RefreshCw,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  FileSpreadsheet,
  ArrowUpDown,
  User,
  Package,
  Activity,
  Eye,
  X,
  XCircle,
  Check,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";

// Simplified - WhatsApp only transactions
interface WhatsappTransactionDetail {
  id: string;
  whatsappPackageId: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  whatsappPackage: {
    id: string;
    name: string;
    priceMonth_idr: number;
    priceMonth_usd: number;
    priceYear_idr: number;
    priceYear_usd: number;
  };
}

interface PaymentDetail {
  id: string;
  amount: number;
  method: string;
  status: string;
  paymentDate?: string;
  serviceFee?: number;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  status: string; // Consolidated status (created, pending, in-progress, success, cancelled, expired)
  type: string;
  currency?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string; // Transaction notes from checkout
  transactionStatusText?: string;
  paymentStatusText?: string;
  canConfirmTransaction?: boolean;
  discountAmount?: number;
  voucher?: {
    id: string;
    code: string;
    type: string; // 'percentage' or 'fixed'
    discountType?: string; // alias for 'type'
    value: number;
  };
  user?: { 
    id: string;
    name: string; 
    email: string;
    phone?: string; // Add phone field
  };
  whatsappTransaction?: WhatsappTransactionDetail;
  payment?: PaymentDetail;
}

interface TransactionStats {
  total: number;
  // Consolidated status stats
  created: number;
  pending: number;
  inProgress: number;
  success: number;
  cancelled: number;
  expired: number;
  totalRevenue: number;
  monthlyRevenue: number;
  // Multi-currency revenue
  totalRevenueIdr: number;
  totalRevenueUsd: number;
  monthlyRevenueIdr: number;
  monthlyRevenueUsd: number;
  averageAmount: number;
}

export default function TransactionPage() {
  const router = useRouter();
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all"); // Payment status filter
  const [transactionStatusFilter, setTransactionStatusFilter] = useState("all"); // Transaction status filter
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "user">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Stats
  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    created: 0,
    pending: 0,
    inProgress: 0,
    success: 0,
    cancelled: 0,
    expired: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalRevenueIdr: 0,
    totalRevenueUsd: 0,
    monthlyRevenueIdr: 0,
    monthlyRevenueUsd: 0,
    averageAmount: 0
  });
  // Helper function to calculate total price with quantity
  const calculateItemTotal = (price: number, quantity: number) => {
    return price * quantity;
  };
  // Helper function to get currency symbol
  const getCurrencySymbol = (currency?: string) => {
    return currency === 'usd' ? '$' : 'Rp';
  };
  
  // Helper function to get transaction type badge - Simplified for WhatsApp only
  const getTransactionTypeBadge = (transaction: Transaction) => {
    if (transaction.whatsappTransaction) {
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">WhatsApp Service</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
  };
  
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Get token for authentication
      const token = SessionManager.getToken();
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      if (transactionStatusFilter !== "all") params.set("status", transactionStatusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const res = await fetch(`/api/admin/transactions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setTransactions(data.data || []);
        setTotal(data.pagination?.total || 0);
        setHasMore(data.pagination?.hasMore || false);
        calculateStats(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [limit, offset, transactionStatusFilter, typeFilter]);

  function calculateStats(transactions: Transaction[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // For revenue, filter by payment status being 'paid' and use final payment amount
    const paidTransactions = transactions.filter(t => t.payment?.status === 'paid');
    const monthlyTransactions = paidTransactions.filter(t => {
      const transactionDate = new Date(t.transactionDate);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    // Calculate revenue by currency using final payment amount (after discount and service fee)
    const totalRevenueIdr = paidTransactions
      .filter(t => t.currency === 'idr')
      .reduce((sum, t) => sum + Number(t.payment?.amount || 0), 0);
    
    const totalRevenueUsd = paidTransactions
      .filter(t => t.currency === 'usd')
      .reduce((sum, t) => sum + Number(t.payment?.amount || 0), 0);

    const monthlyRevenueIdr = monthlyTransactions
      .filter(t => t.currency === 'idr')
      .reduce((sum, t) => sum + Number(t.payment?.amount || 0), 0);
    
    const monthlyRevenueUsd = monthlyTransactions
      .filter(t => t.currency === 'usd')
      .reduce((sum, t) => sum + Number(t.payment?.amount || 0), 0);

    // Total revenue for backward compatibility (IDR equivalent)
    const totalRevenue = totalRevenueIdr + (totalRevenueUsd * 15000); // Rough conversion for display
    const monthlyRevenue = monthlyRevenueIdr + (monthlyRevenueUsd * 15000);

    setStats({
      total: transactions.length,
      // Transaction status stats (using underscore format from API)
      created: transactions.filter(t => t.status === 'created').length,
      pending: transactions.filter(t => t.status === 'pending').length,
      inProgress: transactions.filter(t => t.status === 'in_progress').length,
      success: transactions.filter(t => t.status === 'success').length,
      cancelled: transactions.filter(t => t.status === 'cancelled').length,
      expired: transactions.filter(t => t.status === 'expired').length,
      totalRevenue,
      monthlyRevenue,
      totalRevenueIdr,
      totalRevenueUsd,
      monthlyRevenueIdr,
      monthlyRevenueUsd,
      averageAmount: paidTransactions.length > 0 ? totalRevenue / paidTransactions.length : 0
    });
  }

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);  const filteredTransactions = transactions.filter(transaction => {
    const matchSearch = 
      transaction.id.toLowerCase().includes(search.toLowerCase()) ||
      transaction.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.user?.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchTransactionStatus = transactionStatusFilter === "all" || transaction.status === transactionStatusFilter;
    const matchPaymentStatus = paymentStatusFilter === "all" || transaction.payment?.status === paymentStatusFilter;
    
    return matchSearch && matchTransactionStatus && matchPaymentStatus;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case "amount":
        aValue = Number(a.amount);
        bValue = Number(b.amount);
        break;
      case "user":
        aValue = a.user?.name || "";
        bValue = b.user?.name || "";
        break;
      case "date":
      default:
        aValue = new Date(a.transactionDate).getTime();
        bValue = new Date(b.transactionDate).getTime();
        break;
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });    const getStatusBadge = (status: string, isPaymentStatus: boolean = true) => {
    // Normalize status: convert underscores to hyphens for consistency
    const normalizedStatus = status.replace(/_/g, '-');
    
    if (isPaymentStatus) {
      // Payment status badges
      const statusConfig = {
        pending: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, color: "text-yellow-600" },
        paid: { className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, color: "text-green-600" },
        failed: { className: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle, color: "text-red-600" },
        cancelled: { className: "bg-gray-100 text-gray-800 border-gray-200", icon: X, color: "text-gray-600" },
      };

      const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pending;
      const IconComponent = config.icon;

      return (
        <Badge className={`flex items-center gap-1 ${config.className}`}>
          <IconComponent className="w-3 h-3" />
          {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
        </Badge>
      );
    } else {
      // Transaction status badges
      const transactionStatusConfig = {
        created: { className: "bg-blue-100 text-blue-800 border-blue-200", icon: Activity, color: "text-blue-600" },
        pending: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, color: "text-yellow-600" },
        'in-progress': { className: "bg-orange-100 text-orange-800 border-orange-200", icon: Clock, color: "text-orange-600" },
        success: { className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, color: "text-green-600" },
        cancelled: { className: "bg-gray-100 text-gray-800 border-gray-200", icon: X, color: "text-gray-600" },
        expired: { className: "bg-red-100 text-red-800 border-red-200", icon: XCircle, color: "text-red-600" },
      };

      const config = transactionStatusConfig[normalizedStatus as keyof typeof transactionStatusConfig] || transactionStatusConfig.created;
      const IconComponent = config.icon;

      return (
        <Badge className={`flex items-center gap-1 ${config.className}`}>
          <IconComponent className="w-3 h-3" />
          {normalizedStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      );
    }
  };
  const getTypeBadge = (type: string) => {
    const typeColors = {
      product: "bg-blue-100 text-blue-800 border-blue-200",
      whatsapp_service: "bg-green-100 text-green-800 border-green-200",
      digital_service: "bg-purple-100 text-purple-800 border-purple-200",
    };

    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800 border-gray-200"}>
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'idr') => {
    if (currency.toLowerCase() === 'usd') {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount);
    } else {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR"
      }).format(amount);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleConfirmTransaction = async (transactionId: string) => {
    try {
      // Get token for authentication
      const token = SessionManager.getToken();
      
      const res = await fetch(`/api/transactions/${transactionId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        toast.success('Transaction confirmed successfully');
        fetchTransactions();
      } else {
        throw new Error(data.error || 'Failed to confirm transaction');
      }
    } catch (error) {
      console.error("Error confirming transaction:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to confirm transaction');
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ["ID", "User", "Type", "Amount", "Status", "Date"],
      ...sortedTransactions.map(t => [
        t.id,
        t.user?.name || "N/A",
        t.type,
        t.amount.toString(),
        t.status,
        formatDate(t.transactionDate)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Transaction Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Monitor and manage all transaction activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={exportTransactions} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button 
            onClick={fetchTransactions} 
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                {stats.totalRevenueIdr > 0 && (
                  <div>IDR: {formatCurrency(stats.totalRevenueIdr, 'idr')}</div>
                )}
                {stats.totalRevenueUsd > 0 && (
                  <div>USD: {formatCurrency(stats.totalRevenueUsd, 'usd')}</div>
                )}
                {stats.totalRevenueIdr === 0 && stats.totalRevenueUsd === 0 && (
                  <div>No revenue yet</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Pending completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.success}</div>
              <p className="text-xs text-muted-foreground">
                Successfully processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {stats.monthlyRevenueIdr > 0 && (
                  <div className="text-base sm:text-lg font-bold text-purple-600">
                    {formatCurrency(stats.monthlyRevenueIdr, 'idr')}
                  </div>
                )}
                {stats.monthlyRevenueUsd > 0 && (
                  <div className="text-base sm:text-lg font-bold text-purple-600">
                    {formatCurrency(stats.monthlyRevenueUsd, 'usd')}
                  </div>
                )}
                {stats.monthlyRevenueIdr === 0 && stats.monthlyRevenueUsd === 0 && (
                  <div className="text-base sm:text-lg font-bold text-purple-600">
                    {formatCurrency(0, 'idr')}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Current month (after discounts)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  placeholder="Search by ID, user name, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 sm:pl-10 text-xs sm:text-sm h-8 sm:h-9"
                />
              </div>
            </div>              
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px] text-xs sm:text-sm h-8 sm:h-9">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs sm:text-sm">All Payment Status</SelectItem>
                <SelectItem value="pending" className="text-xs sm:text-sm">Pending</SelectItem>
                <SelectItem value="paid" className="text-xs sm:text-sm">Paid</SelectItem>
                <SelectItem value="failed" className="text-xs sm:text-sm">Failed</SelectItem>
                <SelectItem value="cancelled" className="text-xs sm:text-sm">Cancelled</SelectItem>
              </SelectContent>
            </Select>            
            <Select value={transactionStatusFilter} onValueChange={setTransactionStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px] text-xs sm:text-sm h-8 sm:h-9">
                <SelectValue placeholder="Transaction Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs sm:text-sm">All Transaction Status</SelectItem>
                <SelectItem value="created" className="text-xs sm:text-sm">Created</SelectItem>
                <SelectItem value="pending" className="text-xs sm:text-sm">Pending</SelectItem>
                <SelectItem value="in_progress" className="text-xs sm:text-sm">In Progress</SelectItem>
                <SelectItem value="success" className="text-xs sm:text-sm">Success</SelectItem>
                <SelectItem value="cancelled" className="text-xs sm:text-sm">Cancelled</SelectItem>
                <SelectItem value="expired" className="text-xs sm:text-sm">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px] text-xs sm:text-sm h-8 sm:h-9">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs sm:text-sm">All Types</SelectItem>
                <SelectItem value="product" className="text-xs sm:text-sm">Product</SelectItem>
                <SelectItem value="whatsapp_service" className="text-xs sm:text-sm">WhatsApp Service</SelectItem>
                <SelectItem value="digital_service" className="text-xs sm:text-sm">Digital Service</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
            <CardTitle className="text-sm sm:text-base md:text-lg font-semibold">Transactions</CardTitle>
          </div>
          <CardDescription className="text-[10px] sm:text-xs mt-1">
            Showing {sortedTransactions.length} of {total} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              <span className="ml-2 text-xs sm:text-sm">Loading transactions...</span>
            </div>
          ) : sortedTransactions.length === 0 ? (
            <div className="text-center p-8 text-xs sm:text-sm text-gray-500">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">                  
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-medium">Transaction ID</th>
                    <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-medium">User</th>
                    <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-medium">Type</th>
                    <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-medium">Items & Qty</th>
                    <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-medium">Final Amount</th>
                    <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-medium">Payment Status</th>
                    <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-medium">Transaction Status</th>
                    <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-medium">Date</th>
                    <th className="text-left p-2 sm:p-3 text-[10px] sm:text-xs font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {transaction.id}
                        </code>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{transaction.user?.name || "N/A"}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {transaction.user?.email || "N/A"}
                          </div>
                        </div>
                      </td>                      
                      <td className="p-4">
                        {getTransactionTypeBadge(transaction)}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {/* WhatsApp Service Only */}
                          {transaction.whatsappTransaction && (
                            <div className="text-sm">
                              <span className="font-medium text-green-600">{transaction.whatsappTransaction.whatsappPackage.name}</span>
                              <span className="text-gray-500 ml-2">
                                {transaction.whatsappTransaction.duration === 'year' ? '1 Year' : '1 Month'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-1.5 sm:p-2">
                        <div className="space-y-0.5">
                          {/* Final Amount (after discount and service fee) */}
                          <div className="text-[10px] sm:text-xs font-medium">
                            {transaction.payment ? 
                              formatCurrency(Number(transaction.payment.amount), transaction.currency) :
                              formatCurrency(Number(transaction.amount) - Number(transaction.discountAmount || 0), transaction.currency)
                            }
                          </div>
                          
                          {/* Discount information */}
                          {Number(transaction.discountAmount) > 0 && (
                            <div className="text-[9px] text-green-600 space-y-0">
                              <div>Original: {formatCurrency(Number(transaction.amount), transaction.currency)}</div>
                              <div>Discount: -{formatCurrency(Number(transaction.discountAmount), transaction.currency)}</div>
                            </div>
                          )}
                          
                          {/* Service fee info if payment exists */}
                          {transaction.payment && Number(transaction.payment.serviceFee) > 0 && (
                            <div className="text-[9px] text-blue-600">
                              +{formatCurrency(Number(transaction.payment.serviceFee), transaction.currency)} service fee
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-1.5 sm:p-2">
                        {getStatusBadge(transaction.payment?.status || 'pending', true)}
                      </td>
                      <td className="p-1.5 sm:p-2">
                        {getStatusBadge(transaction.status, false)}
                      </td>
                      <td className="p-1.5 sm:p-2 text-[10px] sm:text-xs">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="p-1.5 sm:p-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(transaction)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            
                            {/* Payment Detail Button - only show if payment exists */}
                            {transaction.payment && (
                              <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/payments/${transaction.payment!.id}`)}>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Detail
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto !p-4 sm:!p-6">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Transaction Details
            </DialogTitle>
            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              Transaction ID: <span className="font-mono text-gray-700 dark:text-gray-300 break-all">{selectedTransaction?.id}</span>
            </div>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
              {/* Status Overview */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="text-center">
                    <div className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5">Payment</div>
                    {getStatusBadge(selectedTransaction.payment?.status || 'pending', true)}
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] sm:text-[10px] text-gray-500 mb-0.5">Transaction</div>
                    {getStatusBadge(selectedTransaction.status, false)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] sm:text-[10px] text-gray-500">Amount</div>
                  <div className="text-[10px] sm:text-xs font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(Number(selectedTransaction.payment?.amount || selectedTransaction.amount), selectedTransaction.currency)}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Name</label>
                    <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                      {selectedTransaction.user?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Email</label>
                    <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                      {selectedTransaction.user?.email || 'Unknown'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Phone/WhatsApp</label>
                    <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                      {selectedTransaction.user?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {selectedTransaction.payment && (
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Payment ID</label>
                      <p className="text-[10px] sm:text-xs font-mono text-gray-700 dark:text-gray-300 mt-0.5 break-all">
                        {selectedTransaction.payment.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Method</label>
                      <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mt-0.5 capitalize">
                        {selectedTransaction.payment.method}
                      </p>
                    </div>
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Payment Amount</label>
                      <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                        {formatCurrency(Number(selectedTransaction.payment.amount), selectedTransaction.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Payment Status</label>
                      <div className="mt-0.5">
                        {getStatusBadge(selectedTransaction.payment.status, true)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Services Information - Simplified without proportional discount calculation */}
              {selectedTransaction.whatsappTransaction && (
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
                    WhatsApp Services Information
                  </h3>
                  <div className="space-y-2">
                    {/* Original Price Display */}
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Original WhatsApp Price</label>
                          <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                            {formatCurrency(
                              selectedTransaction.whatsappTransaction.duration === 'year' 
                                ? (selectedTransaction.currency === 'idr' 
                                  ? selectedTransaction.whatsappTransaction.whatsappPackage.priceYear_idr 
                                  : selectedTransaction.whatsappTransaction.whatsappPackage.priceYear_usd)
                                : (selectedTransaction.currency === 'idr' 
                                  ? selectedTransaction.whatsappTransaction.whatsappPackage.priceMonth_idr 
                                  : selectedTransaction.whatsappTransaction.whatsappPackage.priceMonth_usd),
                              selectedTransaction.currency
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">WhatsApp Final Amount</label>
                          <p className="text-[10px] sm:text-xs font-medium text-green-600 mt-0.5">
                            {formatCurrency(
                              Number(selectedTransaction.payment?.amount || selectedTransaction.amount),
                              selectedTransaction.currency
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-gray-100">
                            {selectedTransaction.whatsappTransaction.whatsappPackage.name}
                          </h4>
                          <p className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                            Duration: {selectedTransaction.whatsappTransaction.duration === 'year' ? '1 Year' : '1 Month'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[9px] sm:text-[10px] text-gray-600">
                            <span>Qty: 1</span>
                            <span>Unit Price: {formatCurrency(
                              selectedTransaction.whatsappTransaction.duration === 'year' 
                                ? (selectedTransaction.currency === 'idr' 
                                  ? selectedTransaction.whatsappTransaction.whatsappPackage.priceYear_idr 
                                  : selectedTransaction.whatsappTransaction.whatsappPackage.priceYear_usd)
                                : (selectedTransaction.currency === 'idr' 
                                  ? selectedTransaction.whatsappTransaction.whatsappPackage.priceMonth_idr 
                                  : selectedTransaction.whatsappTransaction.whatsappPackage.priceMonth_usd),
                              selectedTransaction.currency
                            )}</span>
                          </div>
                        </div>
                        <div className="ml-2 sm:ml-4 text-right">
                          <div className="text-[9px] text-gray-500">Original Price</div>
                          <div className="text-[10px] sm:text-xs font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(
                              selectedTransaction.whatsappTransaction.duration === 'year' 
                                ? (selectedTransaction.currency === 'idr' 
                                  ? selectedTransaction.whatsappTransaction.whatsappPackage.priceYear_idr 
                                  : selectedTransaction.whatsappTransaction.whatsappPackage.priceYear_usd)
                                : (selectedTransaction.currency === 'idr' 
                                  ? selectedTransaction.whatsappTransaction.whatsappPackage.priceMonth_idr 
                                  : selectedTransaction.whatsappTransaction.whatsappPackage.priceMonth_usd),
                              selectedTransaction.currency
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Voucher Information */}
              {selectedTransaction.voucher && (
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
                    Voucher Information
                  </h3>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-[9px] sm:text-[10px]">
                              {selectedTransaction.voucher.code}
                            </Badge>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                            {(selectedTransaction.voucher.discountType || selectedTransaction.voucher.type) === 'percentage' 
                              ? `${selectedTransaction.voucher.value}% discount applied`
                              : `${formatCurrency(Number(selectedTransaction.voucher.value), selectedTransaction.currency)} discount applied`
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Price Breakdown */}
                      <div className="grid grid-cols-1 gap-2 pt-2 border-t border-blue-200 dark:border-blue-600">
                        {(() => {
                          const originalAmount = Number(selectedTransaction.amount);
                          const finalAmount = Number(selectedTransaction.payment?.amount || selectedTransaction.amount);
                          const discountAmount = originalAmount - finalAmount;
                          
                          return (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400">Original Amount:</span>
                                <span className="text-[9px] sm:text-[10px] font-medium text-gray-900 dark:text-gray-100">
                                  {formatCurrency(Math.round(originalAmount), selectedTransaction.currency)}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400">Discount Amount:</span>
                                <span className="text-[9px] sm:text-[10px] font-medium text-red-600">
                                  -{formatCurrency(Math.round(discountAmount), selectedTransaction.currency)}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center pt-1.5 border-t border-blue-200 dark:border-blue-600">
                                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-900 dark:text-gray-100">Final Amount:</span>
                                <span className="text-[10px] sm:text-xs font-bold text-green-600">
                                  {formatCurrency(finalAmount, selectedTransaction.currency)}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Notes */}
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
                  User Notes
                </h3>
                <div className="p-2 dark:bg-blue-900/20 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {selectedTransaction.notes ? (
                    <p className="text-[9px] sm:text-[10px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedTransaction.notes}
                    </p>
                  ) : (
                    <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 italic">
                      No notes provided by the user
                    </p>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
                  Transaction Timeline
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Created At</label>
                    <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                      {formatDate(selectedTransaction.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-wider">Last Updated</label>
                    <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                      {formatDate(selectedTransaction.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
