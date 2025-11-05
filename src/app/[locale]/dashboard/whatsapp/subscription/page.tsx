'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar,
  CreditCard,
  Eye,
  Package,
  Smartphone,
  TrendingUp,
  Users,
  Wifi,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SessionManager } from '@/lib/storage';
import SubscriptionGuard from '@/components/whatsapp/subscription-guard';
import { useCurrency } from '@/hooks/useCurrency';

// Helper function to calculate time remaining
const getTimeRemaining = (targetDate: string) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { text: 'Expired', color: 'text-red-600' };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 1) {
    return { text: `${days} days`, color: days > 7 ? 'text-green-600' : days > 3 ? 'text-yellow-600' : 'text-orange-600' };
  } else if (days === 1) {
    return { text: '1 day', color: 'text-orange-600' };
  } else if (hours > 0) {
    return { text: `${hours}h ${minutes}m`, color: 'text-red-600' };
  } else {
    return { text: `${minutes}m`, color: 'text-red-600' };
  }
};

// Helper function to format date compactly
const formatCompactDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

interface WhatsappPackage {
  id: string;
  name: string;
  description: string;
  priceMonth_idr: number;
  priceMonth_usd: number;
  priceYear_idr: number;
  priceYear_usd: number;
  maxSession: number;
}

interface Subscription {
  id: string;
  customerId: string;
  packageId: string;
  status: string;
  activatedAt: string;
  expiredAt: string;
  updatedAt: string;
  lastSubscriptionAt: string;
  package: WhatsappPackage;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

interface TransactionHistory {
  id: string;
  transactionId: string;
  whatsappPackageId: string;
  duration: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  serviceAmount?: number; // Add service amount field
  transaction: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    transactionDate: string;
    createdAt: string;
    payment: {
      id: string;
      status: string;
      method: string;
      paymentDate: string | null;
    } | null;
  };
  whatsappPackage: WhatsappPackage;
}

interface SubscriptionData {
  activeSubscriptions: Subscription[];
  allSubscriptions: Subscription[];
  transactionHistory: TransactionHistory[];
  stats: {
    activePlans: number;
    maxSessions: number;
    expiredDate: string | null;
    lastSubscriptionDate: string | null;
  };
  hasActiveSubscription: boolean;
}

export default function WhatsAppSubscriptionPage() {
  const { currency } = useCurrency()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllSubscriptions, setShowAllSubscriptions] = useState(false);
  
  // Helper function to format currency
  const formatCurrency = (amount: number, currencyCode: string) => {
    const symbol = currencyCode === 'IDR' || currencyCode === 'idr' ? 'Rp' : '$';
    const formatter = currencyCode === 'IDR' || currencyCode === 'idr' 
      ? amount.toLocaleString('id-ID') 
      : amount.toLocaleString('en-US');
    return `${symbol} ${formatter}`;
  }

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/customer/whatsapp/subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch subscriptions');
      }

      setSubscriptionData(result.data);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subscriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <XCircle className="w-8 h-8 mx-auto mb-2" />
              <p>Error loading subscriptions: {error}</p>
              <Button onClick={fetchSubscriptions} className="mt-4" variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscriptionData) return null;

  return (
    <SubscriptionGuard featureName="WhatsApp Subscription" showRefreshButton={true}>
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 bg-background">
        {/* Header */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">WhatsApp Subscriptions</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your WhatsApp API subscriptions and view usage history</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={showAllSubscriptions} onOpenChange={setShowAllSubscriptions}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto text-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Subscriptions
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[80vh] p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">All Subscriptions</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Complete history of your WhatsApp subscriptions
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-3 sm:space-y-4">
                  {subscriptionData.allSubscriptions.map((subscription) => (
                    <Card key={subscription.id} className="p-3 sm:p-4">
                      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm sm:text-base">{subscription.package.name}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {subscription.package.maxSession} sessions
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Activated: {formatDate(subscription.activatedAt)}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2 sm:text-right">
                          {getStatusBadge(subscription.status)}
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Expires: {formatDate(subscription.expiredAt)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Active Plans</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{subscriptionData.stats.activePlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Max Sessions</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{subscriptionData.stats.maxSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Expired Date</p>
                {subscriptionData.stats.expiredDate ? (
                  <div>
                    <p className="text-sm sm:text-base lg:text-lg font-bold truncate">
                      {formatCompactDate(subscriptionData.stats.expiredDate)}
                    </p>
                    <p className={`text-xs font-medium ${getTimeRemaining(subscriptionData.stats.expiredDate).color}`}>
                      {getTimeRemaining(subscriptionData.stats.expiredDate).text} left
                    </p>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-muted-foreground">N/A</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Last Subscription</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold truncate">
                  {subscriptionData.stats.lastSubscriptionDate ? formatCompactDate(subscriptionData.stats.lastSubscriptionDate) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Subscriptions - Stacked Cards */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Active Subscriptions</h2>
        {subscriptionData.hasActiveSubscription ? (
          <div className="relative">
            {subscriptionData.activeSubscriptions.map((subscription, index) => (
              <Card 
                key={subscription.id} 
                className={`w-full transition-all duration-300 ${
                  index > 0 ? 'absolute top-0 left-0' : 'relative'
                }`}
                style={{
                  transform: `translateY(${index * (window.innerWidth < 640 ? 4 : 8)}px) translateX(${index * (window.innerWidth < 640 ? 4 : 8)}px)`,
                  zIndex: subscriptionData.activeSubscriptions.length - index,
                  opacity: index === 0 ? 1 : 0.7 - (index * 0.1)
                }}
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="truncate">{subscription.package.name}</span>
                    </CardTitle>
                    <div className="flex-shrink-0">
                      {getStatusBadge(subscription.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Max Sessions: {subscription.package.maxSession}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Activated: {formatDate(subscription.activatedAt)}</span>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Expires: {formatDate(subscription.expiredAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Monthly: {formatCurrency(
                          currency === 'idr' ? subscription.package.priceMonth_idr : subscription.package.priceMonth_usd, 
                          currency.toUpperCase()
                        )}</span>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{subscription.package.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {/* Spacer for stacked cards - responsive */}
            <div style={{ height: `${subscriptionData.activeSubscriptions.length * (window.innerWidth < 640 ? 4 : 8)}px` }}></div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 sm:py-8 px-4 sm:px-6">
              <div className="text-center text-muted-foreground">
                <Package className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                {subscriptionData.allSubscriptions.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-sm sm:text-base">No active subscriptions</p>
                    <p className="text-xs sm:text-sm">
                      Last subscription: {subscriptionData.stats.lastSubscriptionDate ? formatDate(subscriptionData.stats.lastSubscriptionDate) : 'N/A'}
                    </p>
                    <Button 
                      className="w-full sm:w-auto text-sm" 
                      onClick={() => window.location.href = '/dashboard/product'}
                    >
                      Subscribe Again
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-sm sm:text-base">No subscriptions found</p>
                    <Button 
                      className="w-full sm:w-auto text-sm" 
                      onClick={() => window.location.href = '/dashboard/product'}
                    >
                      Browse Packages
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Transaction History</h2>
        <Card>
          <CardContent className="p-0">
            {subscriptionData.transactionHistory.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Package</TableHead>
                        <TableHead className="text-xs">Duration</TableHead>
                        <TableHead className="text-xs">Amount</TableHead>
                        <TableHead className="text-xs">Payment</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Start Date</TableHead>
                        <TableHead className="text-xs">End Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptionData.transactionHistory.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{transaction.whatsappPackage.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {transaction.whatsappPackage.maxSession} sessions
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{transaction.duration}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-sm">
                              {formatCurrency(transaction.serviceAmount || transaction.transaction.amount, transaction.transaction.currency.toUpperCase())}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs">
                              {transaction.transaction.payment?.method || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getTransactionStatusBadge(transaction.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {transaction.startDate ? (
                                formatDate(transaction.startDate)
                              ) : (
                                <span className="text-muted-foreground">Not started</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {transaction.endDate ? (
                                formatDate(transaction.endDate)
                              ) : (
                                <span className="text-muted-foreground">Not ended</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  <div className="divide-y">
                    {subscriptionData.transactionHistory.map((transaction) => (
                      <div key={transaction.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{transaction.whatsappPackage.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {transaction.whatsappPackage.maxSession} sessions
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            {getTransactionStatusBadge(transaction.status)}
                            <Badge variant="outline" className="text-xs">{transaction.duration}</Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-medium">
                              {formatCurrency(transaction.serviceAmount || transaction.transaction.amount, transaction.transaction.currency.toUpperCase())}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Payment:</span>
                            <p>{transaction.transaction.payment?.method || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Start:</span>
                            <p>
                              {transaction.startDate ? (
                                formatDate(transaction.startDate)
                              ) : (
                                <span className="text-muted-foreground">Not started</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">End:</span>
                            <p>
                              {transaction.endDate ? (
                                formatDate(transaction.endDate)
                              ) : (
                                <span className="text-muted-foreground">Not ended</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 sm:py-8 px-4 sm:px-6 text-center text-muted-foreground">
                <CreditCard className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No transaction history found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </SubscriptionGuard>
  );
}
