'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Save,
  X,
  ImageIcon,
  ExternalLink,
  Calendar,
  Search,
  Filter,
  Upload,
  Loader2
} from 'lucide-react';
import { SessionManager } from '@/lib/storage';
import Image from 'next/image';
import { toast } from 'sonner';

interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  gallery: string[];
  tech: string[];
  category: string | null;
  description: string | null;
  link: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioFormData {
  title: string;
  image: string;
  gallery: string[];
  tech: string[];
  category: string;
  description: string;
  link: string;
  isActive: boolean;
}

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: '',
    image: '',
    gallery: [],
    tech: [],
    category: '',
    description: '',
    link: '',
    isActive: true
  });
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [techStackInput, setTechStackInput] = useState('');
  const [selectedTechItems, setSelectedTechItems] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');

  // Get unique categories from items
  const categories = Array.from(new Set(portfolioItems.map(item => item.category).filter(Boolean)));
  
  // Get unique tech stack items from all portfolio items
  const allTechItems = Array.from(new Set(
    portfolioItems.flatMap(item => item.tech).filter(Boolean)
  )).sort();

  // Filter items based on search and category
  const filteredItems = portfolioItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         item.tech.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Fetch portfolio items
  const fetchPortfolioItems = async () => {
    try {
      setIsLoading(true);
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/portfolio?includeInactive=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio items');
      }

      const result = await response.json();
      if (result.success) {
        setPortfolioItems(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch portfolio items');
      }
    } catch (error) {
      console.error('Fetch portfolio items error:', error);
      toast.error('Failed to load portfolio items');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle main image upload
  const handleMainImageUpload = async (file: File) => {
    try {
      setUploadingMain(true);
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const uploadFormData = new FormData();
      uploadFormData.append('files', file);
      uploadFormData.append('type', 'main');

      const response = await fetch('/api/admin/portfolio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const result = await response.json();
      if (result.success && result.data.urls.length > 0) {
        setFormData(prev => ({ ...prev, image: result.data.urls[0] }));
        toast.success('Main image uploaded successfully');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Main image upload error:', error);
      toast.error('Failed to upload main image');
    } finally {
      setUploadingMain(false);
    }
  };

  // Handle gallery images upload
  const handleGalleryUpload = async (files: File[]) => {
    try {
      setUploadingGallery(true);
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const uploadFormData = new FormData();
      files.forEach(file => uploadFormData.append('files', file));
      uploadFormData.append('type', 'gallery');

      const response = await fetch('/api/admin/portfolio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const result = await response.json();
      if (result.success && result.data.urls.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          gallery: [...prev.gallery, ...result.data.urls] 
        }));
        toast.success(`${result.data.urls.length} gallery images uploaded successfully`);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
      toast.error('Failed to upload gallery images');
    } finally {
      setUploadingGallery(false);
    }
  };

  // Remove gallery image
  const removeGalleryImage = async (imageUrl: string, index: number) => {
    try {
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Delete from blob storage if it's a blob URL
      if (imageUrl.includes('blob.vercel-storage.com')) {
        await fetch(`/api/admin/portfolio/upload?url=${encodeURIComponent(imageUrl)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Remove from form data
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, i) => i !== index)
      }));
      
      toast.success('Gallery image removed');
    } catch (error) {
      console.error('Remove gallery image error:', error);
      toast.error('Failed to remove gallery image');
    }
  };

  // Remove main image
  const removeMainImage = async () => {
    try {
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Delete from blob storage if it's a blob URL
      if (formData.image && formData.image.includes('blob.vercel-storage.com')) {
        await fetch(`/api/admin/portfolio/upload?url=${encodeURIComponent(formData.image)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      setFormData(prev => ({ ...prev, image: '' }));
      toast.success('Main image removed');
    } catch (error) {
      console.error('Remove main image error:', error);
      toast.error('Failed to remove main image');
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.image) {
      toast.error('Title and main image are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = editingItem 
        ? `/api/admin/portfolio/${editingItem.id}`
        : '/api/admin/portfolio';
      
      const method = editingItem ? 'PUT' : 'POST';

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
        toast.success(editingItem ? 'Portfolio item updated successfully' : 'Portfolio item created successfully');
        resetForm();
        fetchPortfolioItems();
      } else {
        throw new Error(result.error || 'Failed to save portfolio item');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save portfolio item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      image: '',
      gallery: [],
      tech: [],
      category: '',
      description: '',
      link: '',
      isActive: true
    });
    setTechStackInput('');
    setSelectedTechItems([]);
    setCategoryInput('');
    setEditingItem(null);
    setShowForm(false);
  };

  // Handle delete
  const handleDelete = async (item: PortfolioItem) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    try {
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/portfolio/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Portfolio item deleted successfully');
        fetchPortfolioItems();
      } else {
        throw new Error(result.error || 'Failed to delete portfolio item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete portfolio item');
    }
  };

  // Start editing
  const startEdit = (item: PortfolioItem) => {
    setFormData({
      title: item.title,
      image: item.image,
      gallery: item.gallery,
      tech: item.tech,
      category: item.category || '',
      description: item.description || '',
      link: item.link || '',
      isActive: item.isActive
    });
    setTechStackInput('');
    setSelectedTechItems(item.tech);
    setCategoryInput(item.category || '');
    setEditingItem(item);
    setShowForm(true);
  };

  // Start creating new portfolio item
  const startCreate = () => {
    // Reset form data for new item
    setFormData({
      title: '',
      image: '',
      gallery: [],
      tech: [],
      category: '',
      description: '',
      link: '',
      isActive: true
    });
    setTechStackInput('');
    setSelectedTechItems([]);
    setCategoryInput('');
    setEditingItem(null);
    setShowForm(true);
  };

  // Handle tech stack input (allow typing commas)
  const handleTechStackChange = (value: string) => {
    setTechStackInput(value);
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    const combinedTech = [...new Set([...selectedTechItems, ...items])];
    setFormData(prev => ({ ...prev, tech: combinedTech }));
  };

  // Handle tech item selection from dropdown
  const handleTechSelect = (techItem: string) => {
    if (!selectedTechItems.includes(techItem)) {
      const newSelected = [...selectedTechItems, techItem];
      setSelectedTechItems(newSelected);
      setFormData(prev => ({ ...prev, tech: newSelected }));
    }
  };

  // Remove selected tech item
  const removeTechItem = (techItem: string) => {
    const newSelected = selectedTechItems.filter(item => item !== techItem);
    setSelectedTechItems(newSelected);
    setFormData(prev => ({ ...prev, tech: newSelected }));
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategoryInput(value);
    setFormData(prev => ({ ...prev, category: value }));
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

  const handleMainImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleMainImageUpload(imageFiles[0]);
    }
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleGalleryUpload(imageFiles);
    }
  };

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Management</h1>
          <p className="text-muted-foreground">
            Manage your portfolio items and showcase your work
          </p>
        </div>
        <Button onClick={startCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Portfolio Item
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioItems.filter(item => item.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, description, or tech..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category || ''}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the portfolio item details below.' : 'Fill in the details to create a new portfolio item.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Project title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <div className="space-y-2">
                {categories.length > 0 && (
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    value=""
                    onChange={(e) => e.target.value && handleCategoryChange(e.target.value)}
                  >
                    <option value="">Select existing category...</option>
                    {categories.map(category => (
                      <option key={category} value={category || ''}>{category}</option>
                    ))}
                  </select>
                )}
                <Input
                  id="category"
                  value={categoryInput}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  placeholder="Or type new category (Web App, Mobile App, etc.)"
                />
              </div>
            </div>

            {/* Main Image Upload */}
            <div className="space-y-2">
              <Label>Main Image *</Label>
              {formData.image ? (
                <div className="space-y-2">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={formData.image}
                      alt="Main image preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeMainImage}
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
                    onDrop={handleMainImageDrop}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drag & drop or click to upload main image</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, WebP (max 5MB)</p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      className="mt-4"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleMainImageUpload(file);
                        }
                      }}
                      disabled={uploadingMain}
                    />
                  </div>
                  {uploadingMain && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading main image...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Gallery Images Upload */}
            <div className="space-y-2">
              <Label>Gallery Images</Label>
              {formData.gallery.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                  {formData.gallery.map((imageUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={imageUrl}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeGalleryImage(imageUrl, index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 transition-colors hover:border-muted-foreground/50 hover:bg-muted/25"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleGalleryDrop}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop or click to upload gallery images</p>
                  <p className="text-xs text-muted-foreground">Multiple files allowed (max 10)</p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-2"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleGalleryUpload(files);
                    }
                  }}
                  disabled={uploadingGallery}
                />
              </div>
              {uploadingGallery && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading gallery images...
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tech">Tech Stack</Label>
              
              {/* Selected Tech Items */}
              {selectedTechItems.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/50">
                  {selectedTechItems.map((techItem, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {techItem}
                      <button
                        type="button"
                        onClick={() => removeTechItem(techItem)}
                        className="ml-1 text-xs hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tech Selection Dropdown */}
              {allTechItems.length > 0 && (
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value=""
                  onChange={(e) => e.target.value && handleTechSelect(e.target.value)}
                >
                  <option value="">Select existing tech...</option>
                  {allTechItems.filter(tech => !selectedTechItems.includes(tech)).map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              )}

              {/* Manual Input */}
              <Input
                id="tech"
                value={techStackInput}
                onChange={(e) => handleTechStackChange(e.target.value)}
                placeholder="Or type new tech stack (comma-separated): React, Next.js, Node.js"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project and its key features"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Project Link</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://project-demo.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active (visible on public portfolio)</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Portfolio Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Items ({filteredItems.length})</CardTitle>
          <CardDescription>
            Manage your portfolio items below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {portfolioItems.length === 0 ? 'No portfolio items found. Create your first one!' : 'No items match your search criteria.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-28 flex-shrink-0 overflow-hidden bg-muted">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.category && (
                            <Badge variant="secondary">{item.category}</Badge>
                          )}
                          <Badge variant={item.isActive ? "default" : "outline"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.tech.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tech.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Project
                            </a>
                          )}
                          {item.gallery.length > 0 && (
                            <span className="flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {item.gallery.length} gallery images
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(item)}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item)}
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
