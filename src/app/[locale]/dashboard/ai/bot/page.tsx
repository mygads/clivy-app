"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bot, Plus, Eye, Calendar, Link as LinkIcon, FileText } from "lucide-react";
import SubscriptionGuard from "@/components/whatsapp/subscription-guard";
import { SessionManager } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";

interface BotItem {
  id: string;
  name: string;
  isActive: boolean;
  systemPrompt: string | null;
  fallbackText: string | null;
  createdAt: string;
  aiBotSessionBindings: Array<{
    id: string;
    sessionId: string;
    isActive: boolean;
  }>;
  botKnowledgeBindings: Array<{
    id: string;
    documentId: string;
    isActive: boolean;
  }>;
}

export default function BotManagementPage() {
  const [bots, setBots] = useState<BotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    isActive: false,
  });

  const fetchBots = useCallback(async () => {
    try {
      const token = SessionManager.getToken();
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to continue",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch("/api/customer/ai/bot", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (json.success) {
        setBots(json.data);
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to fetch bots",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const handleCreate = async () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Please enter bot name",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = SessionManager.getToken();
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to continue",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch("/api/customer/ai/bot", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          systemPrompt: "",
          fallbackText: "",
          isActive: formData.isActive,
        }),
      });
      const json = await res.json();
      
      if (json.success) {
        toast({
          title: "Success",
          description: "Bot created successfully",
        });
        setShowCreateForm(false);
        setFormData({ name: "", isActive: false });
        fetchBots();
        // Navigate to detail page for configuration
        router.push(`/dashboard/ai/bot/${json.data.id}`);
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to create bot",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bot",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (botId: string, isActive: boolean) => {
    try {
      const token = SessionManager.getToken();
      if (!token) return;

      const res = await fetch("/api/customer/ai/bot", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: botId, isActive }),
      });
      const json = await res.json();
      
      if (json.success) {
        fetchBots();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <SubscriptionGuard>
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </SubscriptionGuard>
    );
  }

  return (
    <SubscriptionGuard>
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 sm:h-8 sm:w-8" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">AI Bot Management</h1>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Configure AI bots with system prompts and knowledge bases
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Badge variant="outline" className="flex items-center space-x-1 sm:space-x-2">
            <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">{bots.length} bots</span>
          </Badge>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)} 
            size="sm" 
            className="flex-1 sm:flex-initial"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Bot
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Bot</CardTitle>
            <CardDescription>
              Create a bot and configure it in the detail page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Bot Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Customer Service Bot"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">
                Activate immediately
              </Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                Create Bot
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ name: "", isActive: false });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bots Grid - Card Layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bots.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="py-12 text-center">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bots yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI bot to get started
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          bots.map((bot) => (
            <Card 
              key={bot.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/ai/bot/${bot.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate flex items-center gap-2">
                      <Bot className="h-4 w-4 shrink-0" />
                      {bot.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={bot.isActive}
                      onCheckedChange={(checked) => {
                        toggleActive(bot.id, checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {new Date(bot.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant={bot.isActive ? "default" : "secondary"} className="text-xs">
                    {bot.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" />
                      Sessions
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {bot.aiBotSessionBindings.filter((b) => b.isActive).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Knowledge
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {bot.botKnowledgeBindings.filter((b) => b.isActive).length}
                    </Badge>
                  </div>
                </div>

                {/* View Button */}
                <div className="pt-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/ai/bot/${bot.id}`);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View & Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </SubscriptionGuard>
  );
}
