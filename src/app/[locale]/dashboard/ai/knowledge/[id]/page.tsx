"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2, FileText, Calendar, Edit } from "lucide-react";
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

interface Document {
  id: string;
  title: string;
  kind: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    kind: "faq",
    content: "",
    isActive: true,
  });

  const fetchDocument = useCallback(async () => {
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

      const res = await fetch(`/api/customer/ai/docs?id=${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      
      if (json.success && json.data) {
        setDocument(json.data);
        setFormData({
          title: json.data.title,
          kind: json.data.kind,
          content: json.data.content,
          isActive: json.data.isActive,
        });
      } else {
        toast({
          title: "Error",
          description: "Document not found",
          variant: "destructive",
        });
        router.push("/dashboard/ai/knowledge");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast, router]);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id, fetchDocument]);

  const handleUpdate = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and content",
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

      const res = await fetch(`/api/customer/ai/docs?id=${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      
      if (json.success) {
        toast({
          title: "Success",
          description: "Document updated successfully",
        });
        setEditing(false);
        fetchDocument();
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to update document",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
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

      const res = await fetch(`/api/customer/ai/docs?id=${id}`, {
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
          description: "Document deleted successfully",
        });
        router.push("/dashboard/ai/knowledge");
      } else {
        toast({
          title: "Error",
          description: json.error || "Failed to delete document",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
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

  if (!document) {
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
            onClick={() => router.push("/dashboard/ai/knowledge")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base Detail</h1>
            <p className="text-sm text-muted-foreground">
              View and edit document information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={handleUpdate} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    title: document.title,
                    kind: document.kind,
                    content: document.content,
                    isActive: document.isActive,
                  });
                }}
                size="sm"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setEditing(true)} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Document Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {editing ? (
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-xl font-bold"
                  />
                ) : (
                  <CardTitle className="text-xl">{document.title}</CardTitle>
                )}
              </div>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created: {new Date(document.createdAt).toLocaleDateString()}
                </span>
                <span>
                  Updated: {new Date(document.updatedAt).toLocaleDateString()}
                </span>
              </CardDescription>
            </div>
            {editing ? (
              <Select 
                value={formData.kind} 
                onValueChange={(value) => setFormData({ ...formData, kind: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faq">FAQ</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="doc">General Doc</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary" className="text-sm">
                {document.kind.toUpperCase()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Content</Label>
            {editing ? (
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                className="mt-2 font-mono text-sm"
              />
            ) : (
              <div className="mt-2 p-4 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{document.content}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label>Document Status</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  This document is currently{" "}
                  <span className="font-semibold">
                    {document.isActive ? "active" : "inactive"}
                  </span>
                </p>
              </div>
              <Badge variant={document.isActive ? "default" : "secondary"}>
                {document.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the knowledge base document &quot;{document.title}&quot;.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </SubscriptionGuard>
  );
}
