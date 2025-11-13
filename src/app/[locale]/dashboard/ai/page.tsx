"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, FileText, BarChart3, MessageSquare } from "lucide-react";
import SubscriptionGuard from "@/components/whatsapp/subscription-guard";
import { SessionManager } from "@/lib/storage";

export default function AIOverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBots: 0,
    activeBots: 0,
    documents: 0,
    messagesThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const token = SessionManager.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [botsRes, docsRes, usageRes] = await Promise.all([
        fetch("/api/customer/ai/bot", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/customer/ai/docs", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("/api/customer/ai/usage", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const botsData = await botsRes.json();
      const docsData = await docsRes.json();
      const usageData = await usageRes.json();

      // Calculate stats
      const totalBots = botsData.success ? botsData.data.length : 0;
      const activeBots = botsData.success 
        ? botsData.data.filter((bot: any) => bot.isActive).length 
        : 0;
      const documents = docsData.success ? docsData.data.length : 0;
      
      // Get messages from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const messagesThisMonth = usageData.success && usageData.data.logs
        ? usageData.data.logs.filter((log: any) => 
            new Date(log.createdAt) >= thirtyDaysAgo
          ).length
        : 0;

      setStats({
        totalBots,
        activeBots,
        documents,
        messagesThisMonth,
      });
    } catch (error) {
      console.error("Failed to fetch AI stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <SubscriptionGuard featureName="AI Configuration" showRefreshButton={true}>
      <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-8 pt-3 sm:pt-4 md:pt-6 bg-background">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">AI Configuration</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
            Manage your AI-powered customer service bots
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalBots}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeBots} active
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.documents}</div>
                  <p className="text-xs text-muted-foreground">
                    Documents uploaded
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages (30d)</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.messagesThisMonth}</div>
                  <p className="text-xs text-muted-foreground">
                    AI responses sent
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push("/dashboard/ai/usage")}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Get started with AI bot management
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:gap-4 md:grid-cols-3 p-3 sm:p-4 md:p-6 pt-0">
            <Button
              onClick={() => router.push("/dashboard/ai/bot")}
              className="h-auto py-3 sm:py-4 flex flex-col items-center gap-2"
              size="sm"
            >
              <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Manage Bots</span>
            </Button>

            <Button
              onClick={() => router.push("/dashboard/ai/knowledge")}
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-center gap-2"
              size="sm"
            >
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Upload Knowledge</span>
            </Button>

            <Button
              onClick={() => router.push("/dashboard/ai/usage")}
              variant="outline"
              className="h-auto py-3 sm:py-4 flex flex-col items-center gap-2"
              size="sm"
            >
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">View Usage</span>
            </Button>
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 md:p-6 pt-0">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                1
              </div>
              <div>
                <h3 className="font-medium text-xs sm:text-sm">Create Your First Bot</h3>
                <p className="text-xs text-muted-foreground">
                  Set up a bot with custom prompts and fallback messages
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                2
              </div>
              <div>
                <h3 className="font-medium text-xs sm:text-sm">Upload Knowledge Base</h3>
                <p className="text-xs text-muted-foreground">
                  Add FAQs, product info, and policies for better responses
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                3
              </div>
              <div>
                <h3 className="font-medium text-xs sm:text-sm">Bind to WhatsApp Session</h3>
                <p className="text-xs text-muted-foreground">
                  Connect your bot to a WhatsApp session to start responding
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SubscriptionGuard>
  );
}
