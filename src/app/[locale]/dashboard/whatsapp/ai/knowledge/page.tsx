"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Trash2 } from "lucide-react";

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
      const res = await fetch("/api/customer/ai/docs");
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
      const res = await fetch("/api/customer/ai/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`/api/customer/ai/docs?id=${id}`, {
        method: "DELETE",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Upload FAQs, product info, and policies to improve AI responses
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Product Return Policy"
              />
            </div>

            <div>
              <Label htmlFor="kind">Type</Label>
              <Select value={formData.kind} onValueChange={(value) => setFormData({ ...formData, kind: value })}>
                <SelectTrigger id="kind">
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
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter document content..."
                rows={8}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Add Document</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
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
  );
}
