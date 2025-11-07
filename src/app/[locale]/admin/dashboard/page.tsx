"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, TrendingUp, Users, DollarSign, ShoppingCart, CreditCard, Calendar, BarChart3, Activity, TrendingDown, Zap, Target, RefreshCw, Tag, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/Auth/AuthContext";
import { useRouter } from "next/navigation";
import { 
  RevenueTrendChart, 
  PaymentMethodChart, 
  HourlyDistributionChart, 
  CategoryChart 
} from "@/components/charts/DashboardCharts";

// Simple loading skeleton component
function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`} />
  );
}

interface DashboardData {
  period: string;
  currency: string;
  overview: {
    totalTransactions: number;
    completedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    conversionRate: number;
    newUsers: number;
    totalActiveUsers: number;
    avgProcessingTime: number;
    revenueGrowthRate: number;
    transactionGrowthRate: number;
    peakHour: number;
    totalServiceFeeRevenue: number;
  };
  whatsappSubscriptions?: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    newSubscriptions: number;
    subscriptionRate: number;
    avgSubscriptionDuration: number;
  };
  categoryPerformance?: {
    totalCategories: number;
    topCategory: {
      type: string;
      revenue: number;
      transactions: number;
    } | null;
    categoryBreakdown: Array<{
      type: string;
      revenue: number;
      transactions: number;
      percentage: number;
    }>;
  };
  revenueCostAnalysis?: {
    grossRevenue: number;
    netRevenue: number;
    serviceFeeRevenue: number;
    discountCost: number;
    profitMargin: number;
    serviceFeeMargin: number;
    discountRate: number;
  };
  revenue: {
    totalRevenue: number;
    grossRevenue: number;
    serviceFeeRevenue: number;
    totalDiscountGiven: number;
    avgOrderValue: number;
    formattedRevenue: string;
    prevMonthRevenue: number;
    revenueGrowth: number;
  };
  paymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  trends: {
    revenue: Array<{
      date: string;
      period: string;
      transactions: number;
      revenue: number;
    }>;
    daily: Array<{
      date: string;
      transactions: number;
      revenue: number;
    }>;
    type: 'hourly' | 'daily' | 'weekly' | 'monthly';
    hourly: Array<{
      hour: number;
      count: number;
      percentage: number;
    }>;
  };
  vouchers: {
    totalUsages: number;
    totalDiscount: number;
    formattedDiscount: string;
    period: string;
    periodLabel: string;
    avgDiscountPerTransaction: number;
    discountRate: number;
    formattedAvgDiscount: string;
  };
  categoryStats: Array<{
    type: string;
    _count: { id: number };
    _sum: { finalAmount: number };
  }>;
  topProducts: Array<{
    id: string;
    productName: string;
    productType: string;
    orderCount: number;
    totalQuantity?: number;
    totalRevenue: number;
    amount: number;
    currency: string;
    period: string;
    avgOrderValue: number;
    date: string;
  }>;
  recentTransactions: Array<{
    id: string;
    userName: string;
    userEmail: string;
    item: string;
    amount: number;
    originalAmount?: number;
    discountAmount?: number;
    status: string;
    paymentMethod: string;
    paymentStatus?: string;
    currency: string;
    date: string;
  }>;
  topUsers: Array<{
    userId: string;
    name: string;
    transactionCount: number;
    totalRevenue: number;
  }>;
  conversionFunnel: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  analytics: {
    totalServiceFeeRevenue: number;
    peakTransactionHour: number;
    conversionRate: number;
    avgProcessingTime: number;
    hourlyDistribution: Array<{
      hour: number;
      count: number;
      percentage: number;
    }>;
    statusDistribution: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
  };
}

function formatCurrency(amount: number | null | undefined, currency: string): string {
  // Handle null, undefined, or NaN values
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return currency === 'idr' ? 'Rp 0' : '$0.00';
  }
  
  const numericAmount = Number(amount);
  
  if (currency === 'idr') {
    return `Rp ${numericAmount.toLocaleString('id-ID')}`;
  } else {
    return `$${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
}

function formatPaymentMethod(method: string): string {
  const methods: { [key: string]: string } = {
    'manual_bank_transfer': 'Bank Transfer',
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'e_wallet': 'E-Wallet',
    'virtual_account': 'Virtual Account',
    'qris': 'QRIS',
    'gopay': 'GoPay',
    'ovo': 'OVO',
    'dana': 'DANA',
    'shopeepay': 'ShopeePay',
    'linkaja': 'LinkAja'
  };
  return methods[method] || method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// function formatPaymentMethod(method: string): string {
//   return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
// }

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Check authentication and admin role
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || !token) {
        router.push('/signin');
        return;
      }
      
      // Check if user has admin role
      if ((user as any).role !== 'admin' && (user as any).role !== 'super_admin') {
        router.push('/signin');
        return;
      }
    }
  }, [user, token, isAuthLoading, router]);

  // Fetch data for IDR only
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data:', { period });
      
      // Use token from AuthContext
      if (!token) {
        console.error('No auth token found');
        router.push('/signin');
        return;
      }
      
      const response = await fetch(`/api/admin/dashboard/analytics?period=${period}&currency=idr`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success) {
          setData(result.data);
        } else {
          console.error('API returned error:', result.error);
        }
      } else {
        const errorText = await response.text();
        console.error('API request failed:', response.status, errorText);
        
        // If 401/403, redirect to admin signin
        if (response.status === 401 || response.status === 403) {
          router.push('/signin');
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [period, token, router]);
  useEffect(() => {
    // Only fetch data if user is authenticated and has admin role
    if (!isAuthLoading && user && token && 
        ((user as any).role === 'admin' || (user as any).role === 'super_admin')) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, isAuthLoading, user, token]);
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'all': return 'All Time';
      default: return 'Today';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'failed': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };
  if (isAuthLoading) {
    return (
      <div className="p-6 space-y-8">
        <div className="flex flex-col gap-2">
          <LoadingSkeleton className="h-8 w-64" />
          <LoadingSkeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return null; // Will redirect in useEffect
  }

  if (loading && !data) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
        <div className="flex flex-col gap-2">
          <LoadingSkeleton className="h-6 w-48 sm:h-8 sm:w-64" />
          <LoadingSkeleton className="h-3 w-64 sm:h-4 sm:w-96" />
        </div>
        <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-24 sm:h-28 md:h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Complete transaction and revenue analysis for {getPeriodLabel(period).toLowerCase()}
          </p>
        </div>

        <div className="flex flex-row gap-2 w-full lg:w-auto">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-auto min-w-[100px] sm:w-[140px] md:w-[160px]">
              <SelectValue />
            </SelectTrigger>            
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time (Debug)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-2 sm:px-3"
          >
            {loading ? <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
        </div>
      </div>

      {/* Overview Stats Cards - Fixed Height */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col">
          <CardContent className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</p>
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-brand-blue/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-brand-blue" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-base sm:text-lg md:text-xl font-bold truncate">
                {data ? data.revenue.formattedRevenue : formatCurrency(0, 'idr')}
              </h3>
              <span className="text-xs font-medium text-green-500 flex items-center whitespace-nowrap">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                {data ? `${data.overview.conversionRate}%` : '0%'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-auto">
              Fee: {data ? formatCurrency(data.revenue.serviceFeeRevenue, 'idr') : formatCurrency(0, 'idr')}
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Transactions</p>
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-brand-red/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-brand-red" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-base sm:text-lg md:text-xl font-bold">{data ? data.overview.totalTransactions : 0}</h3>
              <span className="text-xs font-medium text-green-500 flex items-center whitespace-nowrap">
                <Activity className="h-3 w-3 mr-0.5" />
                {data ? data.overview.completedTransactions : 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-auto">
              {data ? data.overview.pendingTransactions : 0} pending, {data ? data.overview.failedTransactions : 0} failed
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Users</p>
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-brand-blue/10 flex items-center justify-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-brand-blue" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-base sm:text-lg md:text-xl font-bold">{data ? data.overview.totalActiveUsers : 0}</h3>
              <span className="text-xs font-medium text-green-500 flex items-center whitespace-nowrap">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +{data ? data.overview.newUsers : 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-auto">
              Active {getPeriodLabel(period).toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg Order</p>
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-brand-red/10 flex items-center justify-center">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-brand-red" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-base sm:text-lg md:text-xl font-bold truncate">
                {data ? formatCurrency(data.revenue.avgOrderValue, 'idr') : formatCurrency(0, 'idr')}
              </h3>
              <span className={`text-xs font-medium flex items-center whitespace-nowrap ${
                data && data.revenue.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {data && data.revenue.revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                {data ? `${data.revenue.revenueGrowth > 0 ? '+' : ''}${data.revenue.revenueGrowth}%` : '0%'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-auto">
              Conv: {data ? `${data.overview.conversionRate.toFixed(1)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Performance Metrics - Consistent Sizing */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-semibold">Avg Processing</h3>
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
              {data ? `${data.overview.avgProcessingTime}` : '0'} min
            </div>
            <p className="text-xs text-muted-foreground">
              Transaction processing time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-semibold">Peak Hour</h3>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
              {data ? `${data.overview.peakHour}:00` : '00:00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Busiest hour for transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-semibold">Service Fee</h3>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1 truncate">
              {data ? formatCurrency(data.overview.totalServiceFeeRevenue, 'idr') : formatCurrency(0, 'idr')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total service fees earned
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-semibold">Revenue Growth</h3>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
            <div className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 ${
              data && data.overview.revenueGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {data ? `${data.overview.revenueGrowthRate > 0 ? '+' : ''}${data.overview.revenueGrowthRate}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Subscription Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold">WhatsApp Subscription Overview</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getPeriodLabel(period)}
              </Badge>
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
        <div className="grid gap-2 sm:gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="text-center p-2 sm:p-3 md:p-4 border border-white/10 rounded-lg">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-500">
              {data?.whatsappSubscriptions?.totalSubscriptions || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total Subscriptions</p>
          </div>
          
          <div className="text-center p-2 sm:p-3 md:p-4 border border-white/10 rounded-lg">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500">
              {data?.whatsappSubscriptions?.activeSubscriptions || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Active Subscriptions</p>
          </div>
          
          <div className="text-center p-2 sm:p-3 md:p-4 border border-white/10 rounded-lg">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-500">
              {data?.whatsappSubscriptions?.expiredSubscriptions || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Expired</p>
          </div>
          
          <div className="text-center p-2 sm:p-3 md:p-4 border border-white/10 rounded-lg">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-500">
              {data?.whatsappSubscriptions?.newSubscriptions || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">New This Period</p>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 md:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="text-xs sm:text-sm">
              <span className="text-muted-foreground">Subscription Rate: </span>
              <span className={`font-medium ${
                data && data.whatsappSubscriptions && data.whatsappSubscriptions.subscriptionRate >= 80 
                  ? 'text-green-500' 
                  : data && data.whatsappSubscriptions && data.whatsappSubscriptions.subscriptionRate >= 60 
                    ? 'text-yellow-500' 
                    : 'text-red-500'
              }`}>
                {data?.whatsappSubscriptions?.subscriptionRate || 0}%
              </span>
            </div>
            <div className="text-xs sm:text-sm">
              <span className="text-muted-foreground">Avg. Subscription Duration: </span>
              <span className="font-medium">
                {data?.whatsappSubscriptions?.avgSubscriptionDuration || 0} days
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/admin/dashboard/whatsapp-subscriptions'}
            className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950"
          >
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Manage Subscriptions
          </Button>
        </div>
        </CardContent>
      </Card>

      {/* Enhanced Analytics Sections */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Category Performance */}
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold">Category Performance</h3>
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </div>
          <div className="space-y-3 sm:space-y-4">
            {data?.categoryPerformance?.categoryBreakdown && data.categoryPerformance.categoryBreakdown.length > 0 ? (
              data.categoryPerformance.categoryBreakdown.map((category, index) => (
                <div key={category.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-blue-500' : 
                      index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                    }`} />
                    <span className="text-xs sm:text-sm font-medium capitalize">{category.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium">{category.transactions} transactions</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(category.revenue, 'idr')} ({category.percentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              ))
            ) : data?.categoryStats && data.categoryStats.length > 0 ? (
              // Fallback to old categoryStats if new data not available
              data.categoryStats.map((category, index) => (
                <div key={category.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-blue-500' : 
                      index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                    }`} />
                    <span className="text-xs sm:text-sm font-medium capitalize">{category.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium">{category._count.id} transactions</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(Number(category._sum.finalAmount || 0), 'idr')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-6 sm:py-8">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">No category data available</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Revenue vs Cost Analysis */}
        <Card>
          <CardContent className="p-3 sm:p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold">Revenue vs Cost Analysis</h3>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Gross Revenue</span>
                <span className="text-xs sm:text-sm font-medium">
                  {data?.revenueCostAnalysis ? 
                    formatCurrency(data.revenueCostAnalysis.grossRevenue, 'idr') : 
                    data ? formatCurrency(data.revenue.grossRevenue, 'idr') : formatCurrency(0, 'idr')
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div className="bg-green-500 h-1.5 sm:h-2 rounded-full w-full"></div>
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Service Fees</span>
                <span className="text-xs sm:text-sm font-medium">
                  {data?.revenueCostAnalysis ? 
                    formatCurrency(data.revenueCostAnalysis.serviceFeeRevenue, 'idr') : 
                    data ? formatCurrency(data.revenue.serviceFeeRevenue, 'idr') : formatCurrency(0, 'idr')
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div className="bg-blue-500 h-1.5 sm:h-2 rounded-full" style={{ 
                  width: data?.revenueCostAnalysis ? 
                    `${data.revenueCostAnalysis.serviceFeeMargin}%` :
                    data && data.revenue.grossRevenue > 0 
                      ? `${(data.revenue.serviceFeeRevenue / data.revenue.grossRevenue) * 100}%` 
                      : '0%' 
                }}></div>
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Total Discounts</span>
                <span className="text-xs sm:text-sm font-medium text-red-500">
                  -{data?.revenueCostAnalysis ? 
                    formatCurrency(data.revenueCostAnalysis.discountCost, 'idr') :
                    data ? formatCurrency(data.revenue.totalDiscountGiven, 'idr') : formatCurrency(0, 'idr')
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div className="bg-red-500 h-1.5 sm:h-2 rounded-full" style={{ 
                  width: data?.revenueCostAnalysis ?
                    `${data.revenueCostAnalysis.discountRate}%` :
                    data && data.revenue.grossRevenue > 0 
                      ? `${(data.revenue.totalDiscountGiven / data.revenue.grossRevenue) * 100}%` 
                      : '0%' 
                }}></div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-semibold">
                  {data?.revenueCostAnalysis ? 'Profit Margin' : 'Net Revenue'}
                </span>
                <span className={`text-xs sm:text-sm font-bold ${
                  data?.revenueCostAnalysis ? 
                    data.revenueCostAnalysis.profitMargin >= 70 ? 'text-green-500' : 
                    data.revenueCostAnalysis.profitMargin >= 50 ? 'text-yellow-500' : 'text-red-500'
                  : 'text-green-500'
                }`}>
                  {data?.revenueCostAnalysis ? 
                    `${data.revenueCostAnalysis.profitMargin.toFixed(1)}%` :
                    data ? formatCurrency(data.revenue.totalRevenue, 'idr') : formatCurrency(0, 'idr')
                  }
                </span>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Payment Methods Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
          {data?.paymentMethods && data.paymentMethods.length > 0 ? (
            <PaymentMethodChart data={data.paymentMethods} currency={'idr'} />
          ) : (
            <div className="text-center text-muted-foreground py-6 sm:py-8">
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">No payment method data available</p>
              <p className="text-xs mt-2">All transactions use manual bank transfer</p>
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:gap-4 md:gap-6">        
        {/* Revenue Trends Chart */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <CardTitle className="text-base sm:text-lg font-semibold">
                {period === 'today' ? 'Hourly Revenue Trends' :
                 period === 'week' ? 'Daily Revenue Trends (7 Days)' :
                 period === 'month' ? 'Daily Revenue Trends (This Month)' :
                 'Weekly Revenue Trends (All Time)'}
              </CardTitle>
              <Badge variant="outline" className="text-xs">{getPeriodLabel(period)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
          {data?.trends && ((data.trends.revenue && data.trends.revenue.length > 0) || (data.trends.daily && data.trends.daily.length > 0)) ? (
            <RevenueTrendChart 
              data={data.trends} 
              currency={'idr'} 
              period={getPeriodLabel(period)} 
            />
          ) : (
            <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-r from-brand-blue/5 to-brand-red/5 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {period === 'today' ? 'Tidak ada data tren revenue per jam' :
                   period === 'week' ? 'Tidak ada data tren revenue harian (7 hari)' :
                   period === 'month' ? 'Tidak ada data tren revenue harian (bulan ini)' :
                   'Tidak ada data tren revenue mingguan'}
                </p>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Voucher Analytics */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold">
                Top Products ({getPeriodLabel(period)})
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {data?.topProducts?.length || 0} items
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {period === 'today' ? 'Produk terlaris hari ini berdasarkan jumlah pesanan' :
               period === 'week' ? 'Produk terlaris 7 hari terakhir berdasarkan jumlah pesanan' :
               period === 'month' ? 'Produk terlaris bulan ini berdasarkan jumlah pesanan' :
               'Produk terlaris sepanjang waktu berdasarkan jumlah pesanan'}
            </p>
          </CardHeader>
          <div className="p-0 max-h-96 overflow-y-auto">
            {data?.topProducts && data.topProducts.length > 0 ? (
              <div className="divide-y divide-white/10">
                {data.topProducts.map((product, index) => (
                  <div key={product.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-white/5">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brand-blue/10 text-brand-blue font-semibold text-xs sm:text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{product.productName}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground capitalize">{product.productType}</p>
                          <span className="text-xs bg-blue-500/10 text-blue-500 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                            {product.orderCount} orders
                          </span>
                          {product.totalQuantity && product.totalQuantity > 0 && (
                            <span className="text-xs bg-green-500/10 text-green-500 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                              {product.totalQuantity} qty
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-medium text-xs sm:text-sm text-green-600">
                        {formatCurrency(product.totalRevenue || 0, product.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {formatCurrency(product.avgOrderValue || 0, product.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{formatCurrency(product.amount || 0, product.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 sm:p-6 text-center text-muted-foreground">
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">Tidak ada data produk</p>
                <p className="text-xs mt-1 sm:mt-2">
                  {period === 'today' ? 'Belum ada penjualan hari ini' :
                   period === 'week' ? 'Belum ada penjualan minggu ini' :
                   period === 'month' ? 'Belum ada penjualan bulan ini' :
                   'Belum ada data penjualan'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Voucher Analytics */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold">
                Voucher Analytics ({getPeriodLabel(period)})
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {data?.vouchers?.period || period}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Analisis penggunaan voucher dan diskon untuk {data?.vouchers?.periodLabel || getPeriodLabel(period).toLowerCase()}
            </p>
          </CardHeader>
          <CardContent>
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="text-center p-3 sm:p-4 md:p-6 border border-white/10 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-brand-red/10">
                <Tag className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-brand-red" />
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold">{data?.vouchers.totalUsages || 0}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Penggunaan Voucher</p>
              <p className="text-xs text-muted-foreground mt-1">
                {period === 'today' ? 'Hari ini' :
                 period === 'week' ? '7 hari terakhir' :
                 period === 'month' ? '30 hari terakhir' :
                 'Sepanjang waktu'}
              </p>
            </div>
            
            <div className="text-center p-3 sm:p-4 md:p-6 border border-white/10 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 rounded-full bg-brand-blue/10">
                <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-brand-blue" />
              </div>
              <h4 className="text-lg sm:text-xl md:text-2xl font-bold">{data?.vouchers.formattedDiscount || formatCurrency(0, 'idr')}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Diskon Diberikan</p>
              <p className="text-xs text-muted-foreground mt-1">
                Rata-rata: {data?.vouchers?.formattedAvgDiscount || formatCurrency(0, 'idr')} per transaksi
              </p>
            </div>
            
            {/* Additional Voucher Metrics */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="text-center p-2 sm:p-3 md:p-4 border border-white/10 rounded-lg">
                <h5 className="text-base sm:text-lg font-bold text-purple-500">
                  {data?.vouchers?.discountRate ? `${data.vouchers.discountRate.toFixed(1)}%` : '0%'}
                </h5>
                <p className="text-xs text-muted-foreground">Discount Rate</p>
              </div>
              <div className="text-center p-2 sm:p-3 md:p-4 border border-white/10 rounded-lg">
                <h5 className="text-base sm:text-lg font-bold text-orange-500">
                  {data?.vouchers?.totalUsages && data.vouchers.totalUsages > 0 ? 
                    `${((data.vouchers.totalUsages / (data.overview.totalTransactions || 1)) * 100).toFixed(1)}%` : '0%'}
                </h5>
                <p className="text-xs text-muted-foreground">Usage Rate</p>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base sm:text-lg font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs sm:text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-left">
                <th className="p-2 sm:p-3 md:p-4 font-medium text-muted-foreground">ID</th>
                <th className="p-2 sm:p-3 md:p-4 font-medium text-muted-foreground">Customer</th>
                <th className="p-2 sm:p-3 md:p-4 font-medium text-muted-foreground">Item</th>
                <th className="p-2 sm:p-3 md:p-4 font-medium text-muted-foreground">Amount</th>
                <th className="p-2 sm:p-3 md:p-4 font-medium text-muted-foreground">Payment</th>
                <th className="p-2 sm:p-3 md:p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-2 sm:p-3 md:p-4 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/5">
                    <td className="p-2 sm:p-3 md:p-4 font-medium">#{transaction.id.slice(-8)}</td>
                    <td className="p-2 sm:p-3 md:p-4">{transaction.userName || 'Anonymous'}</td>
                    <td className="p-2 sm:p-3 md:p-4">{transaction.item}</td>
                    <td className="p-2 sm:p-3 md:p-4 font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 capitalize">{formatPaymentMethod(transaction.paymentMethod)}</td>
                    <td className="p-2 sm:p-3 md:p-4">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(transaction.status)}
                      >
                        {transaction.status === 'paid' ? 'Completed' : 
                        transaction.status === 'pending' ? 'Pending' : 'Failed'}
                      </Badge>
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 sm:p-6 md:p-8 text-center text-muted-foreground">
                    <Activity className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs sm:text-sm">No recent transactions</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Users and Conversion Funnel */}
      <div className="grid gap-3 sm:gap-4 md:gap-6">
        {/* Top Users */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold">Top Users</CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </div>
          </CardHeader>
          <div className="p-0 max-h-96 overflow-y-auto">
            {data?.topUsers && data.topUsers.length > 0 ? (
              <div className="divide-y divide-white/10">
                {data.topUsers.map((user, index) => (
                  <div key={user.userId} className="p-3 sm:p-4 flex items-center justify-between hover:bg-white/5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-brand-blue/10 text-brand-blue font-semibold text-xs sm:text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{user.name || 'Anonymous User'}</p>
                        <p className="text-xs text-muted-foreground">{user.transactionCount} transaksi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-xs sm:text-sm">{formatCurrency(user.totalRevenue || 0, 'idr')}</p>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 sm:p-6 text-center text-muted-foreground">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs sm:text-sm">Tidak ada data top users</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
