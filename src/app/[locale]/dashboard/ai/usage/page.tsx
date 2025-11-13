"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, MessageSquare, Zap, Clock, Download, Calendar } from "lucide-react";
import SubscriptionGuard from "@/components/whatsapp/subscription-guard";
import { SessionManager } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UsageStats {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  averageLatencyMs: number;
  errorCount: number;
  successRate: string;
}

interface UsageLog {
  id: string;
  sessionId: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: string;
  errorReason: string | null;
  createdAt: string;
}

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const { toast } = useToast();

  // Set default date range (last 30 days)
  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    setDateRange({
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    });
  }, []);

  const fetchUsage = useCallback(async () => {
    try {
      const token = SessionManager.getToken();
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to view usage data",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch("/api/customer/ai/usage", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (json.success) {
        setStats(json.data.statistics);
        setLogs(json.data.logs || []);
      } else {
        toast({
          title: "Failed to Load",
          description: json.error || "Could not fetch usage data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch usage data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast({
        title: "No Data",
        description: "No usage logs available to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Date", "Time", "Session ID", "Input Tokens", "Output Tokens", "Total Tokens", "Latency (ms)", "Status", "Error"];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleDateString(),
      new Date(log.createdAt).toLocaleTimeString(),
      log.sessionId || "N/A",
      log.inputTokens,
      log.outputTokens,
      log.totalTokens,
      log.latencyMs,
      log.status,
      log.errorReason || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ai-usage-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${logs.length} usage logs to CSV`,
    });
  };

  // Filter logs by date range
  const filteredLogs = logs.filter(log => {
    if (!dateRange.from || !dateRange.to) return true;
    const logDate = new Date(log.createdAt);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    return logDate >= fromDate && logDate <= toDate;
  });

  // Prepare chart data - Messages over time
  const messagesOverTimeData = {
    labels: filteredLogs
      .slice(-30)
      .map(log => new Date(log.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: "Messages",
        data: filteredLogs.slice(-30).map((_, idx) => idx + 1),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Token usage breakdown
  const tokenUsageData = {
    labels: ["Input Tokens", "Output Tokens"],
    datasets: [
      {
        label: "Token Usage",
        data: [stats?.totalInputTokens || 0, stats?.totalOutputTokens || 0],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(16, 185, 129, 0.8)"],
        borderColor: ["rgb(59, 130, 246)", "rgb(16, 185, 129)"],
        borderWidth: 1,
      },
    ],
  };

  // Success vs Error rate
  const successRateData = {
    labels: ["Success", "Error"],
    datasets: [
      {
        data: [
          (stats?.totalRequests || 0) - (stats?.errorCount || 0),
          stats?.errorCount || 0,
        ],
        backgroundColor: ["rgba(16, 185, 129, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderColor: ["rgb(16, 185, 129)", "rgb(239, 68, 68)"],
        borderWidth: 1,
      },
    ],
  };

  // Average latency trend (last 20 requests)
  const latencyTrendData = {
    labels: filteredLogs
      .slice(-20)
      .map((_, idx) => `#${filteredLogs.length - 20 + idx + 1}`),
    datasets: [
      {
        label: "Latency (ms)",
        data: filteredLogs.slice(-20).map(log => log.latencyMs),
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <SubscriptionGuard featureName="AI Configuration" showRefreshButton={true}>
    <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-8 pt-3 sm:pt-4 md:pt-6 bg-background">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">AI Usage Analytics</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
          Monitor your AI bot performance and token consumption
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.errorCount || 0} errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Successful responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalTokens || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {(stats?.totalInputTokens || 0).toLocaleString()} in / {(stats?.totalOutputTokens || 0).toLocaleString()} out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageLatencyMs || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              Per request
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usage Details</CardTitle>
              <CardDescription>Recent AI bot activity</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Filter */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <Button onClick={fetchUsage} size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Apply Filter
            </Button>
          </div>

          {/* Charts Grid */}
          {filteredLogs.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Messages Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Line
                      data={messagesOverTimeData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: { beginAtZero: true },
                        },
                      }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Token Usage Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Bar
                      data={tokenUsageData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: { beginAtZero: true },
                        },
                      }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Success vs Error Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Doughnut
                      data={successRateData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "bottom" },
                        },
                      }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Latency Trend (Last 20)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Line
                      data={latencyTrendData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: { beginAtZero: true },
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Usage Logs Table */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Recent Logs ({filteredLogs.length})</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Timestamp</th>
                          <th className="px-4 py-2 text-left font-medium">Session</th>
                          <th className="px-4 py-2 text-right font-medium">Input</th>
                          <th className="px-4 py-2 text-right font-medium">Output</th>
                          <th className="px-4 py-2 text-right font-medium">Total</th>
                          <th className="px-4 py-2 text-right font-medium">Latency</th>
                          <th className="px-4 py-2 text-center font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.slice(0, 50).map((log) => (
                          <tr key={log.id} className="border-t hover:bg-muted/50">
                            <td className="px-4 py-2 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 truncate max-w-[150px]">
                              {log.sessionId ? log.sessionId.slice(0, 8) + "..." : "N/A"}
                            </td>
                            <td className="px-4 py-2 text-right">{log.inputTokens}</td>
                            <td className="px-4 py-2 text-right">{log.outputTokens}</td>
                            <td className="px-4 py-2 text-right font-medium">{log.totalTokens}</td>
                            <td className="px-4 py-2 text-right">{log.latencyMs}ms</td>
                            <td className="px-4 py-2 text-center">
                              <Badge variant={log.status === "ok" ? "default" : "destructive"}>
                                {log.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredLogs.length > 50 && (
                    <div className="px-4 py-3 bg-muted/50 text-xs text-muted-foreground text-center">
                      Showing first 50 of {filteredLogs.length} logs. Export CSV for full data.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No usage data available for the selected date range</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </SubscriptionGuard>
  );
}
