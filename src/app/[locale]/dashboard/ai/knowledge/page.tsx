"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Trash2 } from "lucide-react";
import SubscriptionGuard from "@/components/whatsapp/subscription-guard";
import { SessionManager } from "@/lib/storage";

interface Document {
  id: string;
  title: string;
  kind: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    kind: "faq",
    content: "",
    isActive: true,
  });

  const fetchDocuments = useCallback(async () => {
    try {
      const token = SessionManager.getToken();
      if (!token) {
        alert("Authentication required");
        return;
      }

      const res = await fetch("/api/customer/ai/docs", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (json.success) {
        setDocuments(json.data);
      }
    } catch (error) {
      alert("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      alert("Please fill in title and content");
      return;
    }

    try {
      const token = SessionManager.getToken();
      if (!token) {
        alert("Authentication required");
        return;
      }

      const res = await fetch("/api/customer/ai/docs", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        alert("Document created successfully");
        setShowCreateForm(false);
        setFormData({ title: "", kind: "faq", content: "", isActive: true });
        fetchDocuments();
      } else {
        alert(json.error || "Failed to create document");
      }
    } catch (error) {
      alert("Failed to create document");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const token = SessionManager.getToken();
      if (!token) {
        alert("Authentication required");
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
        alert("Document deleted successfully");
        fetchDocuments();
      } else {
        alert(json.error || "Failed to delete document");
      }
    } catch (error) {
      alert("Failed to delete document");
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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Knowledge Base</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Upload FAQs, product info, and policies to improve AI responses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Badge variant="outline" className="flex items-center space-x-1 sm:space-x-2">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs">{documents.length} docs</span>
          </Badge>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm" className="flex-1 sm:flex-initial">
            <Plus className="mr-2 h-4 w-4" />
            Add Document
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Add New Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6 pt-0">
            <div>
              <Label htmlFor="title" className="text-xs sm:text-sm">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Product Return Policy"
                className="text-xs sm:text-sm"
              />
            </div>

            <div>
              <Label htmlFor="kind" className="text-xs sm:text-sm">Type</Label>
              <Select value={formData.kind} onValueChange={(value) => setFormData({ ...formData, kind: value })}>
                <SelectTrigger id="kind" className="text-xs sm:text-sm">
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
            </div>

            <div>
              <Label htmlFor="content" className="text-xs sm:text-sm">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter document content..."
                rows={8}
                className="text-xs sm:text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} size="sm">Add Document</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)} size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first document to build the knowledge base
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{doc.title}</CardTitle>
                    <CardDescription>
                      {doc.kind.toUpperCase()} • {new Date(doc.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {doc.content.length > 300 ? `${doc.content.substring(0, 300)}...` : doc.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </SubscriptionGuard>
  );
}
