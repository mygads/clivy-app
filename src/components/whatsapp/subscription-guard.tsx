'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package,
  Smartphone,
  ShoppingCart,
  RefreshCw,
  AlertCircle,
  XCircle,
  CheckCircle,
  Clock,
  Calendar,
  Loader2
} from 'lucide-react';
import { SessionManager } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface WhatsappPackage {
  id: string;
  name: string;
  description: string;
  priceMonth: number;  // IDR only
  priceYear: number;   // IDR only
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
}

interface SubscriptionData {
  activeSubscriptions: Subscription[];
  allSubscriptions: Subscription[];
  stats: {
    activePlans: number;
    maxSessions: number;
    expiredDate: string | null;
    lastSubscriptionDate: string | null;
  };
  hasActiveSubscription: boolean;
}

interface SubscriptionGuardProps {
  children: React.ReactNode;
  featureName?: string;
  showRefreshButton?: boolean;
}

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
  
  if (days > 1) {
    return { text: `${days} days`, color: days > 7 ? 'text-green-600' : days > 3 ? 'text-yellow-600' : 'text-orange-600' };
  } else if (days === 1) {
    return { text: '1 day', color: 'text-orange-600' };
  } else if (hours > 0) {
    return { text: `${hours} hours`, color: 'text-red-600' };
  } else {
    return { text: 'Less than 1 hour', color: 'text-red-600' };
  }
};

export default function SubscriptionGuard({ 
  children, 
  featureName = "WhatsApp Services",
  showRefreshButton = true 
}: SubscriptionGuardProps) {
  const t = useTranslations('dashboard.whatsapp');
  const { currency } = useCurrency();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubscriptions = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(!showLoading);
      setError(null);
      
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleRefresh = () => {
    fetchSubscriptions(false);
  };

  const goToProducts = () => {
    window.location.href = '/dashboard/product';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subscription data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <XCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="mb-4">Error loading subscription data: {error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => fetchSubscriptions()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                {showRefreshButton && (
                  <Button onClick={goToProducts} variant="default">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Browse Packages
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No subscription state
  if (!subscriptionData?.hasActiveSubscription) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{featureName}</h1>
            <p className="text-muted-foreground">Access {featureName.toLowerCase()} with an active subscription</p>
          </div>
          {showRefreshButton && (
            <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
              {refreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          )}
        </div>

        {/* No Active Subscription Card */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
              <AlertCircle className="w-6 h-6" />
              <span>No Active Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-orange-600 dark:text-orange-400 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Subscribe to Access {featureName}</h3>
              <p className="text-muted-foreground mb-6">
                You need an active WhatsApp subscription to use {featureName.toLowerCase()}. 
                Choose from our available packages to get started.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={goToProducts} size="lg" className="min-w-[180px]">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Browse Packages
                </Button>
                {showRefreshButton && (
                  <Button onClick={handleRefresh} variant="outline" size="lg" disabled={refreshing}>
                    {refreshing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking Status...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Check Status
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Show subscription history if available */}
            {subscriptionData?.allSubscriptions && subscriptionData.allSubscriptions.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  Previous Subscriptions
                </h4>
                <div className="space-y-2">
                  {subscriptionData.allSubscriptions.slice(0, 2).map((subscription) => (
                    <Card key={subscription.id} className="border-orange-200 bg-white dark:bg-orange-900/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{subscription.package.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {subscription.package.maxSession} sessions • {formatCurrency(
                                  subscription.package.priceMonth, 
                                  'IDR'
                                )}/month
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                              {subscription.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {subscription.status === 'expired' ? 'Expired' : 'Expires'}: {formatDate(subscription.expiredAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {subscriptionData.allSubscriptions.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center">
                      And {subscriptionData.allSubscriptions.length - 2} more previous subscription(s)
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>What You&apos;ll Get</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Multiple Sessions</p>
                  <p className="text-xs text-muted-foreground">Manage multiple WhatsApp accounts</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Package className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">API Access</p>
                  <p className="text-xs text-muted-foreground">Full WhatsApp API integration</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-sm">Campaign Tools</p>
                  <p className="text-xs text-muted-foreground">Schedule and manage campaigns</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has active subscription - show children
  return (
    <>
      {children}
    </>
  );
}
