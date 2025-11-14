"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Trash2, Bot, Calendar, FileText, Link as LinkIcon, Smartphone, AlertTriangle, CheckCircle } from "lucide-react";
import SubscriptionGuard from "@/components/whatsapp/subscription-guard";
import { SessionManager } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BotData {
  id: string;
  name: string;
  isActive: boolean;
  systemPrompt: string | null;
  fallbackText: string | null;
  createdAt: string;
  updatedAt: string;
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

interface KnowledgeDoc {
  id: string;
  title: string;
  kind: string;
  content: string;
  isActive: boolean;
}

interface WhatsAppSession {
  id: string;
  sessionId: string;
  sessionName: string;
  token: string;
  connected: boolean;
  loggedIn: boolean;
  jid: string | null;
  status: string;
}

export default function BotDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [bot, setBot] = useState<BotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);
  const [whatsappSessions, setWhatsappSessions] = useState<WhatsAppSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [bindDialogOpen, setBindDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [binding, setBinding] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    systemPrompt: "",
    fallbackText: "",
    isActive: false,
    selectedKnowledge: [] as string[],
  });

  const fetchBot = useCallback(async () => {
    try {
      const token = SessionManager.getToken();
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to continue",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      const res = await fetch("/api/customer/ai/bot", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      
      if (json.success && json.data) {
        const foundBot = json.data.find((b: BotData) => b.id === id);
        if (foundBot) {
          setBot(foundBot);
          setFormData({
            name: foundBot.name,
            systemPrompt: foundBot.systemPrompt || "",
            fallbackText: foundBot.fallbackText || "",
            isActive: foundBot.isActive,
            selectedKnowledge: foundBot.botKnowledgeBindings
              .filter((b: any) => b.isActive)
              .map((b: any) => b.documentId),
          });
        } else {
          toast({
            title: "Error",
            description: "Bot not found",
            variant: "destructive",
          });
          router.push("/dashboard/ai/bot");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast, router]);

  useEffect(() => {
    if (id) {
      fetchBot();
      fetchKnowledgeDocs();
    }
  }, [id, fetchBot]);

  const fetchKnowledgeDocs = async () => {
    try {
      const token = SessionManager.getToken();
      if (!token) return;

      const res = await fetch("/api/customer/ai/docs", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (json.success) {
        setKnowledgeDocs(json.data || []);
      }
    } catch (error) {
      console.warn("Failed to fetch knowledge docs:", error);
    }
  };

  const fetchWhatsAppSessions = async () => {
    try {
      setLoadingSessions(true);
      const token = SessionManager.getToken();
      if (!token) return;

      const res = await fetch("/api/customer/whatsapp/sessions", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (json.success) {
        setWhatsappSessions(json.data || []);
      }
    } catch (error) {
      console.warn("WhatsApp service unavailable:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Please enter bot name",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const token = SessionManager.getToken();
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to continue",
          variant: "destructive",
        });
        return;
      }

      // Update bot
      const res = await fetch("/api/customer/ai/bot", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name: formData.name,
          systemPrompt: formData.systemPrompt,
          fallbackText: formData.fallbackText,
          isActive: formData.isActive,
        }),
      });
      const json = await res.json();
      
      if (json.success) {
        // Update knowledge bindings
        await fetch(`/api/customer/ai/bot/${id}/knowledge`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentIds: formData.selectedKnowledge }),
        });

        toast({
          title: "Success",
          description: "Bot updated successfully",
        });
        fetchBot();
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to update bot",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bot",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
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

      const res = await fetch(`/api/customer/ai/bot?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      
      if (json.success) {
        toast({
          title: "Success",
          description: "Bot deleted successfully",
        });
        router.push("/dashboard/ai/bot");
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to delete bot",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bot",
        variant: "destructive",
      });
    }
  };

  const handleBindSession = async () => {
    if (!selectedSessionId || !bot) return;

    try {
      setBinding(true);
      const token = SessionManager.getToken();
      if (!token) return;

      const res = await fetch(`/api/customer/ai/bot/${bot.id}/bind`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: selectedSessionId }),
      });
      const json = await res.json();

      if (json.success) {
        toast({
          title: "Success",
          description: "Session bound successfully",
        });
        setBindDialogOpen(false);
        setSelectedSessionId("");
        fetchBot();
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to bind session",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bind session",
        variant: "destructive",
      });
    } finally {
      setBinding(false);
    }
  };

  const handleUnbindSession = async (sessionId: string) => {
    try {
      const token = SessionManager.getToken();
      if (!token) return;

      const res = await fetch(`/api/customer/ai/bot/${id}/bind?sessionId=${sessionId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();

      if (json.success) {
        toast({
          title: "Success",
          description: "Session unbound successfully",
        });
        fetchBot();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unbind session",
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
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </SubscriptionGuard>
    );
  }

  if (!bot) {
    return null;
  }

  return (
    <SubscriptionGuard>
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/ai/bot")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Bot Configuration
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure bot settings, prompts, and knowledge base
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleUpdate} size="sm" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Bot Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created: {new Date(bot.createdAt).toLocaleDateString()}
                </span>
                <span>
                  Updated: {new Date(bot.updatedAt).toLocaleDateString()}
                </span>
              </CardDescription>
            </div>
            <Badge variant={bot.isActive ? "default" : "secondary"}>
              {bot.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
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
            <Label htmlFor="isActive">Bot is active</Label>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt Card */}
      <Card>
        <CardHeader>
          <CardTitle>System Prompt</CardTitle>
          <CardDescription>
            Define how the AI bot should behave and respond to messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            placeholder="You are a helpful customer service assistant..."
            rows={10}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* Fallback Message Card */}
      <Card>
        <CardHeader>
          <CardTitle>Fallback Message</CardTitle>
          <CardDescription>
            Message sent when the AI cannot provide a proper response
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.fallbackText}
            onChange={(e) => setFormData({ ...formData, fallbackText: e.target.value })}
            placeholder="Sorry, I couldn't process your request..."
            rows={3}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* Knowledge Base Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Select which knowledge bases this bot can use
              </CardDescription>
            </div>
            <Badge variant="outline">
              {formData.selectedKnowledge.length} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {knowledgeDocs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No knowledge bases available</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => router.push("/dashboard/ai/knowledge")}
              >
                Create Knowledge Base
              </Button>
            </div>
          ) : (
            <div className="space-y-2 border rounded-md p-4 max-h-96 overflow-y-auto">
              {Object.entries(
                knowledgeDocs.reduce((acc, doc) => {
                  if (!acc[doc.kind]) acc[doc.kind] = [];
                  acc[doc.kind].push(doc);
                  return acc;
                }, {} as Record<string, KnowledgeDoc[]>)
              ).map(([kind, docs]) => (
                <div key={kind} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    {kind}
                  </p>
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-2 ml-4">
                      <input
                        type="checkbox"
                        id={`doc-${doc.id}`}
                        checked={formData.selectedKnowledge.includes(doc.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selectedKnowledge: [...formData.selectedKnowledge, doc.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedKnowledge: formData.selectedKnowledge.filter(
                                (id) => id !== doc.id
                              ),
                            });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`doc-${doc.id}`} className="text-sm cursor-pointer flex-1">
                        {doc.title}
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/ai/knowledge/${doc.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Bindings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>WhatsApp Session Bindings</CardTitle>
              <CardDescription>
                Bind this bot to WhatsApp sessions
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setBindDialogOpen(true);
                fetchWhatsAppSessions();
              }}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Bind Session
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bot.aiBotSessionBindings.filter(b => b.isActive).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Smartphone className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No sessions bound to this bot</p>
              <p className="text-xs mt-1">
                Click &quot;Bind Session&quot; to connect a WhatsApp session
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {bot.aiBotSessionBindings.filter(b => b.isActive).map((binding) => {
                const session = whatsappSessions.find(s => s.id === binding.sessionId);
                return (
                  <div
                    key={binding.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {session ? session.sessionName || session.sessionId : binding.sessionId}
                        </p>
                        {session?.jid && (
                          <p className="text-xs text-muted-foreground">
                            {session.jid.split('@')[0]}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session && (
                        <Badge variant={session.loggedIn ? "default" : "secondary"} className="text-xs">
                          {session.loggedIn ? "Active" : "Offline"}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnbindSession(binding.sessionId)}
                      >
                        Unbind
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the bot &quot;{bot.name}&quot;. All session bindings
              and configurations will be removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete Bot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bind Session Dialog */}
      <Dialog open={bindDialogOpen} onOpenChange={setBindDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bind WhatsApp Session</DialogTitle>
            <DialogDescription>
              Select a WhatsApp session to bind to this bot
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loadingSessions ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Loading sessions...</p>
              </div>
            ) : whatsappSessions.length === 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No WhatsApp sessions found. Please create a session first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {whatsappSessions.map((session) => {
                  const isAlreadyBound = bot.aiBotSessionBindings.some(
                    b => b.sessionId === session.id && b.isActive
                  );
                  return (
                    <div
                      key={session.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedSessionId === session.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      } ${isAlreadyBound ? "opacity-50" : ""}`}
                      onClick={() => !isAlreadyBound && setSelectedSessionId(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {session.sessionName || session.sessionId}
                            </p>
                            {session.jid && (
                              <p className="text-xs text-muted-foreground">
                                {session.jid.split('@')[0]}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAlreadyBound && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Bound
                            </Badge>
                          )}
                          {session.loggedIn ? (
                            <Badge variant="default" className="bg-green-500 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Offline
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBindDialogOpen(false);
                setSelectedSessionId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBindSession}
              disabled={!selectedSessionId || binding || loadingSessions}
            >
              {binding ? "Binding..." : "Bind Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </SubscriptionGuard>
  );
}
