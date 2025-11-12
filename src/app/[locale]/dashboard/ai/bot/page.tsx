"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Bot, Plus, Settings, Link as LinkIcon } from "lucide-react";
import SubscriptionGuard from "@/components/whatsapp/subscription-guard";

interface Bot {
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
}

export default function BotManagementPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    systemPrompt: "",
    fallbackText: "",
    isActive: false,
  });

  const fetchBots = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/ai/bot");
      const json = await res.json();
      if (json.success) {
        setBots(json.data);
      }
    } catch (error) {
      alert("Failed to fetch bots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/customer/ai/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        alert("Bot created successfully");
        setShowCreateForm(false);
        setFormData({ name: "", systemPrompt: "", fallbackText: "", isActive: false });
        fetchBots();
      } else {
        alert(json.error || "Failed to create bot");
      }
    } catch (error) {
      alert("Failed to create bot");
    }
  };

  const handleUpdate = async (bot: Bot) => {
    try {
      const res = await fetch("/api/customer/ai/bot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bot.id,
          name: bot.name,
          systemPrompt: bot.systemPrompt,
          fallbackText: bot.fallbackText,
          isActive: bot.isActive,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Bot updated successfully");
        setEditingBot(null);
        fetchBots();
      } else {
        alert(json.error || "Failed to update bot");
      }
    } catch (error) {
      alert("Failed to update bot");
    }
  };

  const toggleActive = async (botId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/customer/ai/bot/${botId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message || `Bot ${isActive ? "activated" : "deactivated"}`);
        fetchBots();
      } else {
        alert(json.error || "Failed to toggle bot status");
      }
    } catch (error) {
      alert("Failed to toggle bot status");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <SubscriptionGuard featureName="AI Configuration" showRefreshButton={true}>
    <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-8 pt-3 sm:pt-4 md:pt-6 bg-background">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Bot Management</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Create and configure AI bots for your WhatsApp sessions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Badge variant="outline" className="flex items-center space-x-1 sm:space-x-2">
            <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">{bots.length} bots</span>
          </Badge>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm" className="flex-1 sm:flex-initial">
            <Plus className="mr-2 h-4 w-4" />
            Create Bot
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Create New Bot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6 pt-0">
            <div>
              <Label htmlFor="name" className="text-xs sm:text-sm">Bot Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Customer Service Bot"
                className="text-xs sm:text-sm"
              />
            </div>

            <div>
              <Label htmlFor="systemPrompt" className="text-xs sm:text-sm">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="You are a helpful customer service assistant..."
                rows={5}
                className="text-xs sm:text-sm"
              />
            </div>

            <div>
              <Label htmlFor="fallbackText" className="text-xs sm:text-sm">Fallback Message</Label>
              <Textarea
                id="fallbackText"
                value={formData.fallbackText}
                onChange={(e) => setFormData({ ...formData, fallbackText: e.target.value })}
                placeholder="Sorry, I couldn't process your request..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Activate immediately</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create Bot</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bots List */}
      <div className="grid gap-4">
        {bots.length === 0 ? (
          <Card>
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
            <Card key={bot.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="h-6 w-6" />
                    <div>
                      <CardTitle>{bot.name}</CardTitle>
                      <CardDescription>
                        Created {new Date(bot.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={bot.isActive}
                      onCheckedChange={(checked) => toggleActive(bot.id, checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {bot.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>System Prompt</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {bot.systemPrompt || "Default prompt"}
                  </p>
                </div>
                <div>
                  <Label>Fallback Message</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {bot.fallbackText || "Default fallback"}
                  </p>
                </div>
                <div>
                  <Label>Bound Sessions</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {bot.aiBotSessionBindings.filter((b) => b.isActive).length} active session(s)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Bind Session
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
