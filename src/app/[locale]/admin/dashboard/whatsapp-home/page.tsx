"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SessionManager } from "@/lib/storage";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart } from '@/components/ui/line-chart';
import { useCurrency } from "@/hooks/useCurrency";
import { 
  Users, 
  MessageSquare, 
  Activity,
  DollarSign,
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Package,
  Crown,
  Award,
  Target,
  UserCheck,
  Zap,
  Timer,
  TrendingDown,
  Eye,
  Filter
} from "lucide-react";

interface DashboardData {
  // Overall Statistics
  totalSubscribers: number;
  totalActiveSubscriptions: number;
  totalSessions: number;
  totalWhatsAppUsers: number;
  totalRevenue: {
    idr: number;
    usd: number;
  };

  // Message Statistics
  messageStats: {
    totalSent: number;
    totalFailed: number;
    successRate: number;
  };

  // Daily Statistics
  dailyStats: {
    messageSent: number;
    messageFailed: number;
    successRate: number;
    newSubscriptions: number;
  };

  // Monthly Statistics 
  monthlyStats: {
    messageSent: number;
    messageFailed: number;
    successRate: number;
    newSubscriptions: number;
    revenue: {
      idr: number;
      usd: number;
    };
  };

  // Charts Data
  messageChart: Array<{
    date: string;
    sent: number;
    failed: number;
    total: number;
  }>;

  revenueChart: Array<{
    date: string;
    idr: number;
    usd: number;
  }>;

  // Top Users of the Week
  topUsersWeek: Array<{
    id: string;
    name: string;
    email: string;
    totalMessagesSent: number;
    successRate: number;
    activeSessions: number;
  }>;

  // Recent Subscriptions (Last 5)
  recentSubscriptions: Array<{
    id: string;
    userName: string;
    userEmail: string;
    packageName: string;
    activatedAt: string;
    expiredAt: string;
    status: string;
  }>;

  // Top Packages
  topPackages: Array<{
    id: string;
    name: string;
    description: string | null;
    priceMonth_idr: number;
    priceMonth_usd: number;
    priceYear_idr: number;
    priceYear_usd: number;
    maxSession: number;
    purchaseCount: number;
  }>;
}

export default function WhatsAppHomePage() {
  const router = useRouter();
  const { currency } = useCurrency();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get token for authentication
      const token = SessionManager.getToken();
      if (!token) {
        toast.error("Authentication required");
        router.push('/signin');
        return;
      }
      
      const response = await fetch(`/api/admin/whatsapp/dashboard?period=${activeTab}&month=${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setData(result.data);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error("Unauthorized access");
          router.push('/signin');
        } else {
          toast.error(result.error || "Failed to fetch dashboard data");
        }
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [router, activeTab, selectedMonth]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount: number, curr: 'idr' | 'usd' = 'idr') => {
    if (curr === 'usd') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(amount);
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const getMonthName = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading WhatsApp Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No data available</p>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of WhatsApp service performance and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchDashboardData} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Tabs and Month Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'daily' | 'monthly')}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily View
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Monthly View
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'monthly' && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Main Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.messageStats.totalSent + data.messageStats.totalFailed)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              {formatNumber(data.messageStats.totalSent)} sent
              <AlertCircle className="h-3 w-3 text-red-500 ml-2 mr-1" />
              {formatNumber(data.messageStats.totalFailed)} failed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.messageStats.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall message success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(data.totalSessions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active WhatsApp sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalWhatsAppUsers)}</div>
            <p className="text-xs text-muted-foreground">
              Users with active WhatsApp service
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (IDR)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totalRevenue.idr, 'idr')}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue from WhatsApp packages (IDR)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totalRevenue.usd, 'usd')}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue from WhatsApp packages (USD)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period-specific Stats */}
      <Tabs value={activeTab} className="space-y-6">
        <TabsContent value="daily" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today: Messages Sent</CardTitle>
                <MessageSquare className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(data.dailyStats.messageSent)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Messages sent today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today: Failed</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(data.dailyStats.messageFailed)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Failed messages today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today: Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {data.dailyStats.successRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Today&apos;s success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Subscriptions</CardTitle>
                <UserCheck className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(data.dailyStats.newSubscriptions)}
                </div>
                <p className="text-xs text-muted-foreground">
                  New subscriptions today
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Statistics for {getMonthName(selectedMonth)}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly: Messages Sent</CardTitle>
                <MessageSquare className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(data.monthlyStats.messageSent)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Messages sent this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly: Failed</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(data.monthlyStats.messageFailed)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Failed messages this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly: Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {data.monthlyStats.successRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  This month&apos;s success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Subscriptions</CardTitle>
                <UserCheck className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(data.monthlyStats.newSubscriptions)}
                </div>
                <p className="text-xs text-muted-foreground">
                  New subscriptions this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Revenue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue (IDR)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.monthlyStats.revenue.idr, 'idr')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue for {getMonthName(selectedMonth)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue (USD)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.monthlyStats.revenue.usd, 'usd')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue for {getMonthName(selectedMonth)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Message Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={data.messageChart}
              lines={[
                { key: 'sent', name: 'Messages Sent', color: '#22c55e' },
                { key: 'failed', name: 'Messages Failed', color: '#ef4444' },
                { key: 'total', name: 'Total Messages', color: '#3b82f6' }
              ]}
              xAxis="date"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={data.revenueChart}
              lines={[
                { key: 'idr', name: 'Revenue IDR', color: '#22c55e' },
                { key: 'usd', name: 'Revenue USD', color: '#3b82f6' }
              ]}
              xAxis="date"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Users of the Week & Recent Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users of the Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Top Users This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topUsersWeek.length > 0 ? (
                data.topUsersWeek.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Activity className="h-3 w-3" />
                          {user.activeSessions} sessions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatNumber(user.totalMessagesSent)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.successRate.toFixed(1)}% success
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No top users data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-500" />
              Recent Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentSubscriptions.length > 0 ? (
                data.recentSubscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{sub.userName}</p>
                      <p className="text-sm text-muted-foreground">{sub.userEmail}</p>
                      <p className="text-sm text-blue-600 font-medium">{sub.packageName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                        {sub.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(sub.activatedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent subscriptions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalSubscribers)}</div>
            <p className="text-xs text-muted-foreground">
              All WhatsApp subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(data.totalActiveSubscriptions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(data.totalSessions)}
            </div>
            <p className="text-xs text-muted-foreground">
              All WhatsApp sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top WhatsApp Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Most Popular WhatsApp Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.topPackages.length > 0 ? (
              data.topPackages.map((pkg, index) => (
                <Card key={pkg.id} className="relative">
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                        <Crown className="h-3 w-3 mr-1" />
                        #1
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <div className="text-sm font-bold text-blue-600">
                        #{index + 1}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {pkg.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            {formatCurrency(currency === 'idr' ? pkg.priceMonth_idr : pkg.priceMonth_usd, currency === 'idr' ? 'idr' : 'usd')}/month
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pkg.maxSession} max sessions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            {formatNumber(pkg.purchaseCount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            purchases
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No package data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}