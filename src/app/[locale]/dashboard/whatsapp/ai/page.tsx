"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, FileText, BarChart3, MessageSquare } from "lucide-react";

export default function AIOverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBots: 0,
    activeBots: 0,
    documents: 0,
    messagesThisMonth: 0,
  });

  useEffect(() => {
    // TODO: Fetch stats from APIs
    // GET /api/ai/bot -> count
    // GET /api/ai/docs -> count
    // GET /api/ai/usage -> this month's count
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Bot Dashboard</h1>
        <p className="text-muted-foreground mt-2">
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
            <div className="text-2xl font-bold">{stats.totalBots}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeBots} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents}</div>
            <p className="text-xs text-muted-foreground">
              Documents uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages (30d)</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messagesThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              AI responses sent
            </p>
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
              onClick={() => router.push("/dashboard/whatsapp/ai/usage")}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with AI bot management
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button
            onClick={() => router.push("/dashboard/whatsapp/ai/bot")}
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <Bot className="h-6 w-6" />
            <span>Manage Bots</span>
          </Button>

          <Button
            onClick={() => router.push("/dashboard/whatsapp/ai/knowledge")}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <FileText className="h-6 w-6" />
            <span>Upload Knowledge</span>
          </Button>

          <Button
            onClick={() => router.push("/dashboard/whatsapp/ai/usage")}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <BarChart3 className="h-6 w-6" />
            <span>View Usage</span>
          </Button>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              1
            </div>
            <div>
              <h3 className="font-medium">Create Your First Bot</h3>
              <p className="text-sm text-muted-foreground">
                Set up a bot with custom prompts and fallback messages
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              2
            </div>
            <div>
              <h3 className="font-medium">Upload Knowledge Base</h3>
              <p className="text-sm text-muted-foreground">
                Add FAQs, product info, and policies for better responses
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              3
            </div>
            <div>
              <h3 className="font-medium">Bind to WhatsApp Session</h3>
              <p className="text-sm text-muted-foreground">
                Connect your bot to a WhatsApp session to start responding
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
