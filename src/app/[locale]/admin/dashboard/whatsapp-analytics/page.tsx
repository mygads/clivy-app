"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Search,
  RefreshCw,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  TrendingUp,
  BarChart3,
  Send,
  XCircle,
  MessageSquare,
  ImageIcon,
  FileText,
  Mic,
  Video,
  Smile,
  MapPin,
  Contact,
  Mail
} from "lucide-react";
import { SessionManager } from '@/lib/storage';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface MessageType {
  sent: number;
  failed: number;
}

interface MessageTypeChart {
  type: string;
  sent: number;
  failed: number;
  total: number;
  successRate: string;
}

interface UserAnalytics {
  userId: string;
  totalSent: number;
  totalFailed: number;
  totalMessages: number;
  successRate: string;
  messageTypeBreakdown: Record<string, { sent: number; failed: number }>;
  mostUsedMessageType: string;
  activeSessions: number;
  totalSessions: number;
  sessionDetails: {
    sessionId: string;
    sessionName: string;
    status: string;
    connected: boolean;
    createdAt: string;
    messagesSent: number;
    messagesFailed: number;
    lastMessageAt: string | null;
  }[];
  daysSinceJoined: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
  } | null;
  subscription: {
    packageName: string;
    maxSession: number;
    status: string;
    expiresAt: string;
    activatedAt: string;
  } | null;
}

interface RecentActivity {
  userId: string;
  totalMessagesSent: number;
  totalMessagesFailed: number;
  lastMessageSentAt: string;
  user: {
    name: string;
    email: string;
  } | null;
}

interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  totalMessageStats: number;
  totalMessagesSent: number;
  totalMessagesFailed: number;
  messageTypes: Record<string, MessageType>;
  messageTypeChartData: MessageTypeChart[];
  sessionStats: Record<string, number>;
  topUsers: UserAnalytics[];
  recentActivity: RecentActivity[];
}

interface ApiResponse {
  success: boolean;
  data: AnalyticsData;
  error?: string;
}

export default function WhatsAppAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalSessions: 0,
    totalMessageStats: 0,
    totalMessagesSent: 0,
    totalMessagesFailed: 0,
    messageTypes: {},
    messageTypeChartData: [],
    sessionStats: {},
    topUsers: [],
    recentActivity: []
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAnalytics | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Fetch analytics data using the correct API endpoint
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = SessionManager.getToken();
      if (!token) {
        router.push('/signin');
        return;
      }
      
      const res = await fetch("/api/admin/whatsapp/analytics", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      const data: ApiResponse = await res.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        console.error("Error fetching analytics:", data.error);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Initial load and auto refresh effects
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto refresh functionality - more frequent like sessions page
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchAnalytics, 10000); // Refresh every 10 seconds for real-time monitoring
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchAnalytics]);

  // View user details
  const viewUserDetails = (user: UserAnalytics) => {
    setSelectedUser(user);
    setShowDetailDialog(true);
  };

  // Export function
  const exportAnalytics = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "User ID,User Name,User Email,Messages Sent,Messages Failed,Success Rate\n" +
      filteredTopUsers.map(u => {
        const successRate = u.totalSent > 0 ? ((u.totalSent / (u.totalSent + u.totalFailed)) * 100).toFixed(2) : '0';
        return `${u.userId},"${u.user?.name || 'Unknown'}","${u.user?.email || 'Unknown'}",${u.totalSent},${u.totalFailed},${successRate}%`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `whatsapp_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTopUsers = analytics.topUsers.filter(user => {
    const matchesSearch = (user.user?.name && user.user.name.toLowerCase().includes(search.toLowerCase())) || 
                         (user.user?.email && user.user.email.toLowerCase().includes(search.toLowerCase())) ||
                         (user.userId && user.userId.toLowerCase().includes(search.toLowerCase()));
    
    return matchesSearch;
  });

  const getSuccessRate = (sent: number, failed: number) => {
    const total = sent + failed;
    if (total === 0) return "0";
    return ((sent / total) * 100).toFixed(2);
  };

  const getSuccessRateBadge = (sent: number, failed: number) => {
    const rate = parseFloat(getSuccessRate(sent, failed));
    
    if (rate >= 90) {
      return (
        <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Excellent ({rate}%)
        </Badge>
      );
    } else if (rate >= 70) {
      return (
        <Badge className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700">
          <Clock className="w-3 h-3 mr-1" />
          Good ({rate}%)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700">
          <AlertCircle className="w-3 h-3 mr-1" />
          Poor ({rate}%)
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Analytics</h1>
        <p className="text-muted-foreground">
          Monitor WhatsApp usage statistics and user activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{analytics.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{analytics.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Messages Sent</p>
                <p className="text-2xl font-bold text-green-600">{analytics.totalMessagesSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Messages Failed</p>
                <p className="text-2xl font-bold text-red-600">{analytics.totalMessagesFailed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getSuccessRate(analytics.totalMessagesSent, analytics.totalMessagesFailed)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Message Types Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of messages by content type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {analytics.messageTypeChartData.length > 0 ? (
                <Pie
                  data={{
                    labels: analytics.messageTypeChartData.map(item => item.type),
                    datasets: [
                      {
                        data: analytics.messageTypeChartData.map(item => item.total),
                        backgroundColor: [
                          '#3B82F6', // blue
                          '#10B981', // green
                          '#F59E0B', // yellow
                          '#EF4444', // red
                          '#8B5CF6', // purple
                          '#F97316', // orange
                          '#06B6D4', // cyan
                          '#84CC16', // lime
                          '#EC4899', // pink
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const item = analytics.messageTypeChartData[context.dataIndex];
                            return `${item.type}: ${item.total} messages (${item.successRate}% success)`;
                          }
                        }
                      }
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No message data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Type Statistics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message Type Details
            </CardTitle>
            <CardDescription>
              Detailed statistics for each message type. Failed counts are estimated proportionally from total failed messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.messageTypeChartData.map((item) => {
                const getIcon = (type: string) => {
                  switch (type.toLowerCase()) {
                    case 'text': return <MessageSquare className="h-4 w-4" />;
                    case 'image': return <ImageIcon className="h-4 w-4" />;
                    case 'document': return <FileText className="h-4 w-4" />;
                    case 'audio': return <Mic className="h-4 w-4" />;
                    case 'video': return <Video className="h-4 w-4" />;
                    case 'sticker': return <Smile className="h-4 w-4" />;
                    case 'location': return <MapPin className="h-4 w-4" />;
                    case 'contact': return <Contact className="h-4 w-4" />;
                    case 'template': return <Mail className="h-4 w-4" />;
                    default: return <MessageSquare className="h-4 w-4" />;
                  }
                };

                return (
                  <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getIcon(item.type)}
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.total} total messages
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-green-600">{item.sent}</span>
                        <span className="text-sm text-muted-foreground">/</span>
                        <span className="text-sm font-medium text-red-600">{item.failed}</span>
                      </div>
                      <Badge 
                        variant={parseFloat(item.successRate) >= 90 ? "default" : 
                                parseFloat(item.successRate) >= 70 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {item.successRate}% success
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {analytics.messageTypeChartData.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  No message type data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Users by Message Activity
              </CardTitle>
              <CardDescription>
                Users with highest WhatsApp message activity
              </CardDescription>
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-64"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAnalytics}
                  disabled={loading}
                  className="whitespace-nowrap"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="whitespace-nowrap"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Auto Refresh
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportAnalytics}
                  className="whitespace-nowrap"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Messages Sent</TableHead>
                <TableHead>Messages Failed</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTopUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {loading ? "Loading analytics..." : "No user activity found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTopUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.user?.name || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground">{user.user?.email || 'No email'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">{user.totalSent}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-600">{user.totalFailed}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSuccessRateBadge(user.totalSent, user.totalFailed)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewUserDetails(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity (Last 30 Days)
          </CardTitle>
          <CardDescription>
            Latest WhatsApp messaging activity from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Messages Sent</TableHead>
                <TableHead>Messages Failed</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.recentActivity.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No recent activity found
                  </TableCell>
                </TableRow>
              ) : (
                analytics.recentActivity.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{activity.user?.name || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground">{activity.user?.email || 'No email'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">{activity.totalMessagesSent}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600 font-medium">{activity.totalMessagesFailed}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(activity.lastMessageSentAt).toLocaleDateString()} {new Date(activity.lastMessageSentAt).toLocaleTimeString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Analytics Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">User Name</p>
                    <p className="text-lg font-semibold">{selectedUser.user?.name || 'Unknown'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg font-semibold">{selectedUser.user?.email || 'No email'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-lg font-semibold">{selectedUser.user?.phone || 'No phone'}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Message Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.totalMessages}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Messages Sent</p>
                    <p className="text-2xl font-bold text-green-600">{selectedUser.totalSent}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Messages Failed</p>
                    <p className="text-2xl font-bold text-red-600">{selectedUser.totalFailed}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedUser.successRate}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Account Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Most Used Type</p>
                    <p className="text-lg font-semibold text-indigo-600 capitalize">{selectedUser.mostUsedMessageType}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                    <p className="text-lg font-semibold text-blue-600">{selectedUser.activeSessions}/{selectedUser.totalSessions}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Days Since Joined</p>
                    <p className="text-lg font-semibold text-gray-600">{selectedUser.daysSinceJoined} days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                    <p className="text-lg font-semibold text-gray-600">
                      {selectedUser.user?.createdAt ? new Date(selectedUser.user.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Info */}
              {selectedUser.subscription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subscription Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Package</p>
                        <p className="text-lg font-semibold text-blue-600">{selectedUser.subscription.packageName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Max Sessions</p>
                        <p className="text-lg font-semibold text-purple-600">{selectedUser.subscription.maxSession}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge className={selectedUser.subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {selectedUser.subscription.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Expires</p>
                        <p className="text-sm font-semibold text-orange-600">
                          {new Date(selectedUser.subscription.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Activated At</p>
                        <p className="text-sm font-semibold">
                          {new Date(selectedUser.subscription.activatedAt).toLocaleDateString()} {new Date(selectedUser.subscription.activatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Session Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Details</CardTitle>
                  <CardDescription className="text-sm">
                    WhatsApp sessions and their message activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedUser.sessionDetails && selectedUser.sessionDetails.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUser.sessionDetails.map((session, index) => (
                        <div key={session.sessionId} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{session.sessionName}</h4>
                              <p className="text-sm text-muted-foreground">{session.sessionId}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={
                                  session.connected || session.status === 'connected' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                                }
                              >
                                {session.connected || session.status === 'connected' ? 'Connected' : 'Disconnected'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded">
                              <div className="font-semibold text-green-600 dark:text-green-400">{session.messagesSent}</div>
                              <div className="text-xs text-muted-foreground">Messages Sent</div>
                            </div>
                            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded">
                              <div className="font-semibold text-red-600 dark:text-red-400">{session.messagesFailed}</div>
                              <div className="text-xs text-muted-foreground">Messages Failed</div>
                            </div>
                            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded">
                              <div className="font-semibold text-blue-600 dark:text-blue-400">{session.messagesSent + session.messagesFailed}</div>
                              <div className="text-xs text-muted-foreground">Total Messages</div>
                            </div>
                            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded">
                              <div className="font-semibold text-gray-600 dark:text-gray-400">
                                {new Date(session.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">Created</div>
                            </div>
                          </div>

                          {session.lastMessageAt && (
                            <div className="mt-3 pt-2 border-t">
                              <p className="text-sm text-muted-foreground">
                                Last activity: {new Date(session.lastMessageAt).toLocaleDateString()} {new Date(session.lastMessageAt).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No sessions found for this user</p>
                  )}
                </CardContent>
              </Card>

              {/* Message Type Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Message Type Breakdown</CardTitle>
                  <CardDescription className="text-sm">
                    Failed counts are estimated proportionally from total failed messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(selectedUser.messageTypeBreakdown).map(([type, data]) => (
                      <div key={type} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold capitalize text-sm mb-2">{type}</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Sent:</span>
                            <span className="font-semibold text-green-600">{data.sent}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Failed:</span>
                            <span className="font-semibold text-red-600">{data.failed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total:</span>
                            <span className="font-semibold">{data.sent + data.failed}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
