'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Image as ImageIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Save,
  X,
  Upload,
  Loader2,
  Move,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { SessionManager } from '@/lib/storage';
import Image from 'next/image';
import { toast } from 'sonner';

interface ClientLogo {
  id: string;
  logoUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ClientLogoFormData {
  logoUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export default function ClientLogosPage() {
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLogo, setEditingLogo] = useState<ClientLogo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ClientLogoFormData>({
    logoUrl: '',
    isActive: true,
    sortOrder: 0
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Fetch client logos
  const fetchClientLogos = async () => {
    try {
      setIsLoading(true);
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/client-logos?includeInactive=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch client logos');
      }

      const result = await response.json();
      if (result.success) {
        setClientLogos(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch client logos');
      }
    } catch (error) {
      console.error('Fetch client logos error:', error);
      toast.error('Failed to load client logos');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (file: File) => {
    try {
      setUploadingLogo(true);
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/admin/client-logos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const result = await response.json();
      if (result.success && result.data.logoUrl) {
        setFormData(prev => ({ ...prev, logoUrl: result.data.logoUrl }));
        toast.success('Logo uploaded successfully');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Remove logo
  const removeLogo = async () => {
    try {
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Delete from blob storage if it's a blob URL
      if (formData.logoUrl && formData.logoUrl.includes('blob.vercel-storage.com')) {
        await fetch(`/api/admin/client-logos/upload?url=${encodeURIComponent(formData.logoUrl)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      setFormData(prev => ({ ...prev, logoUrl: '' }));
      toast.success('Logo removed');
    } catch (error) {
      console.error('Remove logo error:', error);
      toast.error('Failed to remove logo');
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.logoUrl) {
      toast.error('Logo is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = editingLogo 
        ? `/api/admin/client-logos/${editingLogo.id}`
        : '/api/admin/client-logos';
      
      const method = editingLogo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        toast.success(editingLogo ? 'Client logo updated successfully' : 'Client logo created successfully');
        resetForm();
        fetchClientLogos();
      } else {
        throw new Error(result.error || 'Failed to save client logo');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save client logo');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      logoUrl: '',
      isActive: true,
      sortOrder: 0
    });
    setEditingLogo(null);
    setShowForm(false);
  };

  // Handle delete
  const handleDelete = async (logo: ClientLogo) => {
    if (!confirm('Are you sure you want to delete this client logo?')) {
      return;
    }

    try {
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/client-logos/${logo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Client logo deleted successfully');
        fetchClientLogos();
      } else {
        throw new Error(result.error || 'Failed to delete client logo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete client logo');
    }
  };

  // Start editing
  const startEdit = (logo: ClientLogo) => {
    setFormData({
      logoUrl: logo.logoUrl,
      isActive: logo.isActive,
      sortOrder: logo.sortOrder
    });
    setEditingLogo(logo);
    setShowForm(true);
  };

  // Start creating new client logo
  const startCreate = () => {
    // Get next sort order
    const maxOrder = Math.max(...clientLogos.map(logo => logo.sortOrder), 0);
    setFormData({
      logoUrl: '',
      isActive: true,
      sortOrder: maxOrder + 1
    });
    setEditingLogo(null);
    setShowForm(true);
  };

  // Move logo up/down in order
  const moveLogo = async (logo: ClientLogo, direction: 'up' | 'down') => {
    const currentIndex = clientLogos.findIndex(l => l.id === logo.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= clientLogos.length) {
      return;
    }

    const targetLogo = clientLogos[targetIndex];
    
    try {
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Swap sort orders
      await Promise.all([
        fetch(`/api/admin/client-logos/${logo.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            logoUrl: logo.logoUrl,
            isActive: logo.isActive,
            sortOrder: targetLogo.sortOrder
          })
        }),
        fetch(`/api/admin/client-logos/${targetLogo.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            logoUrl: targetLogo.logoUrl,
            isActive: targetLogo.isActive,
            sortOrder: logo.sortOrder
          })
        })
      ]);

      toast.success('Logo order updated');
      fetchClientLogos();
    } catch (error) {
      console.error('Move logo error:', error);
      toast.error('Failed to update logo order');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleLogoUpload(imageFiles[0]);
    }
  };

  useEffect(() => {
    fetchClientLogos();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Logos Management</h1>
          <p className="text-muted-foreground">
            Manage client logos displayed on the about page
          </p>
        </div>
        <Button onClick={startCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Client Logo
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientLogos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Logos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientLogos.filter(logo => logo.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Logos</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientLogos.filter(logo => !logo.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLogo ? 'Edit Client Logo' : 'Add New Client Logo'}</DialogTitle>
            <DialogDescription>
              {editingLogo ? 'Update the client logo details below.' : 'Upload a new client logo.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo *</Label>
              {formData.logoUrl ? (
                <div className="space-y-2">
                  <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden bg-white dark:bg-gray-900 flex items-center justify-center p-4">
                    <Image
                      src={formData.logoUrl}
                      alt="Logo preview"
                      width={120}
                      height={120}
                      className="max-h-full max-w-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-muted-foreground/50 hover:bg-muted/25"
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleLogoDrop}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drag & drop or click to upload logo</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, SVG (max 2MB)</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">📐 Recommended: Square (1:1) ratio - e.g., 200x200px</p>
                      <p className="text-xs text-muted-foreground">Non-square logos will have white/dark padding added</p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      className="mt-4"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleLogoUpload(file);
                        }
                      }}
                      disabled={uploadingLogo}
                    />
                  </div>
                  {uploadingLogo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading logo...
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                placeholder="Sort order (lower numbers appear first)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active (visible on public page)</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : (editingLogo ? 'Update' : 'Create')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Client Logos List */}
      <Card>
        <CardHeader>
          <CardTitle>Client Logos ({clientLogos.length})</CardTitle>
          <CardDescription>
            Manage your client logos below. Use the arrow buttons to reorder logos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : clientLogos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No client logos found. Create your first one!
            </div>
          ) : (
            <div className="space-y-4">
              {clientLogos.map((logo, index) => (
                <div key={logo.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden bg-white dark:bg-gray-900 rounded flex items-center justify-center p-2">
                        <Image
                          src={logo.logoUrl}
                          alt={`Client logo ${logo.sortOrder}`}
                          width={64}
                          height={64}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Logo #{logo.sortOrder}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            logo.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {logo.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(logo.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveLogo(logo, 'up')}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveLogo(logo, 'down')}
                        disabled={index === clientLogos.length - 1}
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(logo)}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(logo)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}