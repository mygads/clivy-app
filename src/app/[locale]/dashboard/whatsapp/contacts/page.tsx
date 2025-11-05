'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertCircle,
  CheckCircle,
  Upload,
  Plus,
  X,
  Database,
  Users,
  Smartphone,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  FileText,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SessionManager } from '@/lib/storage';
import SubscriptionGuard from '@/components/whatsapp/subscription-guard';

interface Contact {
  telp: string;
  fullname: string;
  selected?: boolean;
}

interface WhatsAppSession {
  id: string;
  sessionId: string;
  sessionName: string;
  token: string;
  connected: boolean;
  loggedIn: boolean;
  jid: string | null;
  qrcode: string | null;
  status: string;
  createdAt: string;
}

interface SessionsData {
  sessions: WhatsAppSession[];
  hasActiveSubscription: boolean;
  activeSubscriptions: number;
}

export default function ContactsPage() {
  const t = useTranslations();
  
  // Session state
  const [sessionsData, setSessionsData] = useState<SessionsData | null>(null);
  const [selectedSession, setSelectedSession] = useState<WhatsAppSession | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [filterText, setFilterText] = useState('');

  // Manual contact input
  const [manualContacts, setManualContacts] = useState<string[]>(['']);
  const [inputMode, setInputMode] = useState<'single' | 'separate'>('single');
  const [separateContacts, setSeparateContacts] = useState<{phone: string, name: string}[]>([{phone: '', name: ''}]);

  // Excel import state
  const [excelContacts, setExcelContacts] = useState<Contact[]>([]);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk selection and deletion state
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [deletingContacts, setDeletingContacts] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Fetch sessions on mount
    fetchSessions();
  }, []);

  // Contact Management Functions
  const fetchContacts = useCallback(async () => {
    const jwtToken = SessionManager.getToken();
    if (!jwtToken) {
      setError('Authentication required');
      return;
    }

    setContactsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API}/bulk/contact`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const contactsData = data.data || [];
        // Transform API response to match our Contact interface
        const transformedContacts = contactsData.map((contact: any) => ({
          telp: contact.phone,
          fullname: contact.full_name,
          selected: false
        }));
        setContacts(transformedContacts);
      } else {
        throw new Error('Failed to fetch contacts');
      }
    } catch (err) {
      console.error('Fetch contacts error:', err);
      // Don't show error for contacts, just log it
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const syncContactsFromWhatsApp = async () => {
    const jwtToken = SessionManager.getToken();
    if (!jwtToken) {
      setError('Authentication required');
      return;
    }

    if (!selectedSession?.token) {
      setError('Please select a WhatsApp session first');
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API}/bulk/contact/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
          'token': selectedSession.token, // WhatsApp session token for external server access
        },
      });

      if (response.ok) {
        const data = await response.json();
        const phoneNumber = selectedSession.jid ? selectedSession.jid.replace('@s.whatsapp.net', '').split(':')[0] : 'unknown';
        setSuccess(`Contact sync completed for whatsapp number ${phoneNumber}`);
        // Refresh contacts list
        fetchContacts();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync contacts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync contacts');
      console.error('Sync contacts error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const addContactsManually = async (newContacts: { phone: string; full_name: string }[]) => {
    const jwtToken = SessionManager.getToken();
    if (!jwtToken) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API}/bulk/contact/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ contacts: newContacts }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Processed ${newContacts.length} contacts (${data.data.added_count} added, ${data.data.updated_count} updated)`);
        // Refresh contacts list
        fetchContacts();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add contacts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contacts');
      console.error('Add contacts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveManualContactsToDatabase = async () => {
    let validContacts: { phone: string; full_name: string }[] = [];

    if (inputMode === 'single') {
      // Validate single form contacts - remove empty entries and format properly
      validContacts = manualContacts
        .filter(contact => contact.trim() !== '')
        .map(phone => {
          const cleanPhone = phone.trim();
          // Extract name if provided in format "name:phone" or just use phone
          const [nameOrPhone, phoneNumber] = cleanPhone.includes(':')
            ? cleanPhone.split(':').map(s => s.trim())
            : ['', cleanPhone];

          const finalPhone = phoneNumber || nameOrPhone;
          const finalName = phoneNumber ? nameOrPhone : `Contact ${finalPhone.slice(-4)}`;

          return {
            phone: finalPhone,
            full_name: finalName
          };
        });
    } else {
      // Validate separate form contacts
      validContacts = separateContacts
        .filter(contact => contact.phone.trim() !== '')
        .map(contact => ({
          phone: contact.phone.trim(),
          full_name: contact.name.trim() || `Contact ${contact.phone.slice(-4)}`
        }));
    }

    if (validContacts.length === 0) {
      setError('Please add at least one valid contact');
      return;
    }

    try {
      await addContactsManually(validContacts);
      // Clear contacts after successful save
      if (inputMode === 'single') {
        setManualContacts(['']);
      } else {
        setSeparateContacts([{phone: '', name: ''}]);
      }
    } catch (err) {
      // Error is already handled in addContactsManually
    }
  };  // Use syncContactsFromWhatsApp for UI button
  const syncContacts = syncContactsFromWhatsApp;

  // Bulk delete contacts
  const bulkDeleteContacts = async () => {
    if (selectedContacts.size === 0) {
      setError('Please select contacts to delete');
      return;
    }

    const jwtToken = SessionManager.getToken();
    if (!jwtToken) {
      setError('Authentication required');
      return;
    }

    setDeletingContacts(true);
    try {
      const phoneNumbers = Array.from(selectedContacts);
      const response = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API}/bulk/contact/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          phone: phoneNumbers
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Successfully deleted ${data.data.deleted_count} contacts`);
        
        // Clear selected contacts
        setSelectedContacts(new Set());
        setSelectAll(false);
        
        // Refresh contacts list
        fetchContacts();
        setShowDeleteConfirm(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete contacts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contacts');
      console.error('Bulk delete contacts error:', err);
    } finally {
      setDeletingContacts(false);
    }
  };

  // Handle individual contact selection
  const handleContactSelection = (phone: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(phone);
    } else {
      newSelected.delete(phone);
    }
    setSelectedContacts(newSelected);
    
    // Update select all state
    const filteredContacts = contacts.filter(contact =>
      contact.fullname.toLowerCase().includes(filterText.toLowerCase()) ||
      contact.telp.includes(filterText)
    );
    setSelectAll(filteredContacts.length > 0 && filteredContacts.every(contact => newSelected.has(contact.telp)));
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    const filteredContacts = contacts.filter(contact =>
      contact.fullname.toLowerCase().includes(filterText.toLowerCase()) ||
      contact.telp.includes(filterText)
    );
    
    const newSelected = new Set(selectedContacts);
    
    if (checked) {
      filteredContacts.forEach(contact => newSelected.add(contact.telp));
    } else {
      filteredContacts.forEach(contact => newSelected.delete(contact.telp));
    }
    
    setSelectedContacts(newSelected);
    setSelectAll(checked);
  };

  // Load contacts on mount
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Handle session selection
  const handleSessionChange = (sessionId: string) => {
    const session = sessionsData?.sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setError('');
    }
  };

  // Get available sessions (only logged in ones)
  const getAvailableSessions = () => {
    if (!sessionsData?.sessions) return [];
    return sessionsData.sessions.filter(session => session.loggedIn);
  };

  // Fetch WhatsApp sessions
  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const token = SessionManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/customer/whatsapp/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to fetch sessions');
      }

      setSessionsData({
        sessions: result.data || [],
        hasActiveSubscription: result.subscription ? true : false,
        activeSubscriptions: 1
      });
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSessionsLoading(false);
    }
  };

  // Add manual contact
  const addManualContact = () => {
    setManualContacts(prev => [...prev, '']);
  };

  // Remove manual contact
  const removeManualContact = (index: number) => {
    setManualContacts(prev => prev.filter((_, i) => i !== index));
  };

  // Update manual contact
  const updateManualContact = (index: number, value: string) => {
    setManualContacts(prev => prev.map((contact, i) => i === index ? value : contact));
  };

  // Add separate contact
  const addSeparateContact = () => {
    setSeparateContacts(prev => [...prev, {phone: '', name: ''}]);
  };

  // Remove separate contact
  const removeSeparateContact = (index: number) => {
    setSeparateContacts(prev => prev.filter((_, i) => i !== index));
  };

  // Update separate contact
  const updateSeparateContact = (index: number, field: 'phone' | 'name', value: string) => {
    setSeparateContacts(prev => prev.map((contact, i) => 
      i === index ? {...contact, [field]: value} : contact
    ));
  };

  // Handle Excel file upload
  const handleExcelUpload = useCallback((file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setError('Please select a valid Excel or CSV file');
      return;
    }

    setUploadingExcel(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;

        if (file.name.endsWith('.csv')) {
          // Handle CSV
          const text = data as string;
          const lines = text.split('\n').filter(line => line.trim());
          const contacts: Contact[] = [];

          lines.forEach((line, index) => {
            const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
            if (columns.length >= 1 && columns[0]) {
              // Try to extract phone number (remove non-digits except +)
              const phone = columns[0].replace(/[^\d+]/g, '');
              const name = columns[1] || `Contact ${index + 1}`;

              if (phone && (phone.startsWith('+') || phone.length >= 8)) {
                contacts.push({
                  telp: phone,
                  fullname: name,
                  selected: false
                });
              }
            }
          });

          setExcelContacts(contacts);
          setSuccess(`Successfully imported ${contacts.length} contacts from CSV file`);
          setTimeout(() => setSuccess(null), 3000);
        } else {
          // Handle Excel files - for now just show error as we need xlsx library
          setError('Excel file support coming soon. Please use CSV format for now.');
        }
      } catch (err) {
        console.error('File parsing error:', err);
        setError('Failed to parse the file. Please check the format.');
      } finally {
        setUploadingExcel(false);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, []);

  // Execute Excel import
  const executeExcelImport = async () => {
    if (excelContacts.length === 0) {
      setError('No contacts to import');
      return;
    }

    const contactsToAdd = excelContacts.map(contact => ({
      phone: contact.telp,
      full_name: contact.fullname
    }));

    try {
      await addContactsManually(contactsToAdd);
      // Clear excel contacts after successful import
      setExcelContacts([]);
    } catch (err) {
      // Error is already handled in addContactsManually
    }
  };

  // Download Excel template (empty with headers only)
  const downloadTemplate = () => {
    // Create empty template with only headers
    const templateData = [
      ['Phone Number', 'Name'] // Only headers, no sample data
    ];

    // Convert to CSV format
    const csvContent = templateData
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'whatsapp_contacts_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleExcelUpload(file);
    }
  };

  // Filtered contacts
  const filteredContacts = contacts.filter(contact =>
    contact.fullname.toLowerCase().includes(filterText.toLowerCase()) ||
    contact.telp.includes(filterText)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <SubscriptionGuard featureName="WhatsApp Contacts" showRefreshButton={true}>
      <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-8 pt-3 sm:pt-4 md:pt-6 bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Contact Management</h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Import and manage your WhatsApp contacts</p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1 sm:space-x-2 w-fit">
          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-[10px] sm:text-xs">{contacts.length} total contacts</span>
        </Badge>
      </div>

      {/* WhatsApp Session Selection */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-600" />
              <span className="text-xs sm:text-sm md:text-base">WhatsApp Session</span>
            </div>
            <Button
              onClick={fetchSessions}
              disabled={sessionsLoading}
              size="sm"
              variant="outline"
              className="w-fit h-7 sm:h-8 px-2 sm:px-3"
            >
              {sessionsLoading ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-4 sm:py-6 md:py-8">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-spin" />
            <span className="ml-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
              Loading sessions...
            </span>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {getAvailableSessions().length === 0 ? (
              <div className="text-center py-4 sm:py-6 md:py-8">
                <Smartphone className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground mb-2 sm:mb-3" />
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-2">
                  {sessionsData?.sessions.length === 0
                    ? 'No WhatsApp sessions found'
                    : 'No logged-in WhatsApp sessions available'
                  }
                </p>
                <Link
                  href="/dashboard/whatsapp/devices"
                  className="text-[10px] sm:text-xs md:text-sm text-primary hover:underline font-medium"
                >
                  Manage Sessions
                </Link>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-[10px] sm:text-xs md:text-sm font-medium">
                  Select WhatsApp Session
                </Label>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {getAvailableSessions().map((session) => (
                    <div
                      key={session.id}
                      className={`border rounded-lg p-2 sm:p-3 md:p-4 cursor-pointer transition-all hover:border-primary/50 ${
                        selectedSession?.id === session.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                      onClick={() => handleSessionChange(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <input
                            type="radio"
                            id={session.id}
                            name="whatsapp-session"
                            value={session.id}
                            checked={selectedSession?.id === session.id}
                            onChange={(e) => handleSessionChange(e.target.value)}
                            className="h-3 w-3 sm:h-4 sm:w-4 text-primary focus:ring-primary"
                          />
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <div>
                              <span className="text-[10px] sm:text-xs md:text-sm font-medium">
                                {session.sessionName}
                              </span>
                                {session.jid && (
                                <div className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">
                                  {session.jid.replace('@s.whatsapp.net', '').split(':')[0]}
                                </div>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          {session.loggedIn ? (
                            <div className="flex items-center space-x-1">
                              <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5">
                                Connected
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                              <Badge variant="destructive" className="text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5">
                                Disconnected
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </CardContent>
      </Card>

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Left Column: Import Methods */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Excel/CSV Import */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span className="text-xs sm:text-sm md:text-base">Import from Excel/CSV</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center space-x-1 sm:space-x-2 w-fit h-7 sm:h-8 px-2 sm:px-3"
                  title="Download empty CSV template with headers only"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs">Download Template</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
              <div 
                className={`border-2 border-dashed rounded-lg p-3 sm:p-4 md:p-6 transition-colors ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
                  <Upload className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto transition-colors ${
                    isDragOver ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-sm sm:text-base md:text-lg font-medium">Upload Excel or CSV File</h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground mt-1 sm:mt-2">
                      Supported formats: Excel (.xlsx, .xls) or CSV files
                    </p>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">
                      Format: First column = Phone Number, Second column = Name (optional)
                    </p>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleExcelUpload(file);
                      }}
                      disabled={uploadingExcel}
                      className="max-w-xs mx-auto text-[10px] sm:text-xs"
                    />
                    {uploadingExcel && (
                      <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        <span className="text-[10px] sm:text-xs">Processing file...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Imported Contacts Preview */}
              {excelContacts.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <h4 className="text-xs sm:text-sm md:text-base font-medium">Preview ({excelContacts.length} contacts)</h4>
                    <Button
                      onClick={executeExcelImport}
                      disabled={loading}
                      size="sm"
                      className="w-fit h-7 sm:h-8 px-2 sm:px-3"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                          <span className="text-[10px] sm:text-xs">Importing...</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="text-[10px] sm:text-xs">Import to Database</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="max-h-40 sm:max-h-48 md:max-h-60 overflow-y-auto space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-3">
                    {excelContacts.map((contact, index) => (
                      <div key={index} className="flex items-center space-x-2 p-1.5 sm:p-2 bg-muted/30 rounded">
                        <div className="flex-1">
                          <div className="text-[10px] sm:text-xs md:text-sm font-medium">{contact.fullname}</div>
                          <div className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">{contact.telp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Input */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center space-x-1 sm:space-x-2">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="text-xs sm:text-sm md:text-base">Manual Input</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <h3 className="text-sm sm:text-base md:text-lg font-medium">Add Contacts Manually</h3>
                  <div className="flex items-center space-x-1 sm:space-x-2 w-fit">
                    <Button
                      variant={inputMode === 'single' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInputMode('single')}
                      className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                    >
                      Single Form
                    </Button>
                    <Button
                      variant={inputMode === 'separate' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInputMode('separate')}
                      className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                    >
                      Separate Forms
                    </Button>
                  </div>
                </div>

                {inputMode === 'single' ? (
                  <>
                    <div className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      <strong>Supported formats:</strong><br />
                      • Phone only: <code>6281234567890</code><br />
                      • With name: <code>John Doe:6281234567890</code>
                    </div>

                    <div className="space-y-1 sm:space-y-2 max-h-40 sm:max-h-48 md:max-h-60 overflow-y-auto">
                      {manualContacts.map((contact, index) => (
                        <div key={index} className="flex items-center space-x-1 sm:space-x-2">
                          <Input
                            placeholder="e.g., John:6281234567890 or 6281234567890"
                            value={contact}
                            onChange={(e) => updateManualContact(index, e.target.value)}
                            className="text-[10px] sm:text-xs h-8 sm:h-9"
                          />
                          {manualContacts.length > 1 && (
                            <Button
                              onClick={() => removeManualContact(index)}
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button onClick={addManualContact} size="sm" variant="outline" className="h-7 sm:h-8 px-2 sm:px-3">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="text-[10px] sm:text-xs">Add Number</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      Enter contact details in separate fields for better organization
                    </div>

                    <div className="space-y-1 sm:space-y-2 max-h-40 sm:max-h-48 md:max-h-60 overflow-y-auto">
                      {separateContacts.map((contact, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            placeholder="Full Name"
                            value={contact.name}
                            onChange={(e) => updateSeparateContact(index, 'name', e.target.value)}
                            className="text-[10px] sm:text-xs h-8 sm:h-9"
                          />
                          <div className="flex space-x-1 sm:space-x-2">
                            <Input
                              placeholder="Phone Number"
                              value={contact.phone}
                              onChange={(e) => updateSeparateContact(index, 'phone', e.target.value)}
                              className="flex-1 text-[10px] sm:text-xs h-8 sm:h-9"
                            />
                            {separateContacts.length > 1 && (
                              <Button
                                onClick={() => removeSeparateContact(index)}
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button onClick={addSeparateContact} size="sm" variant="outline" className="h-7 sm:h-8 px-2 sm:px-3">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="text-[10px] sm:text-xs">Add Contact</span>
                    </Button>
                  </>
                )}

                {/* Save to Database Button */}
                {((inputMode === 'single' && manualContacts.some(c => c.trim() !== '')) ||
                  (inputMode === 'separate' && separateContacts.some(c => c.phone.trim() !== ''))) && (
                  <div className="pt-2 border-t">
                    <Button
                      onClick={saveManualContactsToDatabase}
                      disabled={loading}
                      size="sm"
                      variant="outline"
                      className="w-full h-8 sm:h-9"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                          <span className="text-[10px] sm:text-xs">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="text-[10px] sm:text-xs">Save to Database</span>
                        </>
                      )}
                    </Button>
                    <div className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground mt-1 text-center">
                      Save these numbers to your contact database for future use
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contact Database */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Contact Database */}
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-0">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Database className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span className="text-xs sm:text-sm md:text-base">Contact Database</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={syncContacts}
                          disabled={syncing || !selectedSession}
                          size="sm"
                          variant="outline"
                          className="h-7 sm:h-8 px-2 sm:px-3"
                        >
                          {syncing ? (
                            <>
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                              <span className="text-[10px] sm:text-xs hidden sm:inline">Syncing...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-2" />
                              <span className="text-[10px] sm:text-xs hidden sm:inline">Sync from WhatsApp</span>
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('dashboard.whatsapp.bulk.contactSources.syncContactsTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    onClick={fetchContacts}
                    disabled={contactsLoading}
                    size="sm"
                    variant="outline"
                    className="h-7 sm:h-8 px-2 sm:px-3"
                  >
                    {contactsLoading ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={selectedContacts.size === 0 || deletingContacts}
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive h-7 sm:h-8 px-2 sm:px-3"
                  >
                    {deletingContacts ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                        <span className="text-[10px] sm:text-xs hidden sm:inline">Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-2" />
                        <span className="text-[10px] sm:text-xs hidden sm:inline">Delete Selected ({selectedContacts.size})</span>
                        <span className="text-[10px] sm:hidden">({selectedContacts.size})</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              {/* Search and Pagination Controls */}
              <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex-1 max-w-full sm:max-w-sm">
                    <Input
                      placeholder="Search contacts..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      className="text-[10px] sm:text-xs h-8 sm:h-9"
                    />
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 w-fit">
                    <Label className="text-[10px] sm:text-xs whitespace-nowrap">Show:</Label>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                      <SelectTrigger className="w-16 sm:w-20 h-8 sm:h-9 text-[10px] sm:text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pagination Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-[10px] sm:text-xs text-muted-foreground">
                  <div>
                    Showing {filteredContacts.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredContacts.length)} of {filteredContacts.length} contacts
                  </div>
                  <div>
                    Page {currentPage} of {totalPages || 1}
                  </div>
                </div>
              </div>

              {/* Contacts Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8 sm:w-12">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all contacts"
                            className="w-3 h-3 sm:w-4 sm:h-4"
                          />
                        </TableHead>
                        <TableHead className="text-[10px] sm:text-xs">Name</TableHead>
                        <TableHead className="text-[10px] sm:text-xs">Phone Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactsLoading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 sm:py-6 md:py-8">
                            <div className="flex items-center justify-center">
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-spin mr-1 sm:mr-2" />
                              <span className="text-[10px] sm:text-xs">Loading contacts...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredContacts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 sm:py-6 md:py-8 text-muted-foreground text-[10px] sm:text-xs">
                            {!selectedSession
                              ? 'Please select a WhatsApp session first to load contacts'
                              : contacts.length === 0
                                ? 'No contacts found. Import some contacts to get started.'
                                : 'No contacts match your search.'
                            }
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentContacts.map((contact) => (
                          <TableRow key={contact.telp} className="hover:bg-muted/50">
                            <TableCell className="py-2 sm:py-3">
                              <Checkbox
                                checked={selectedContacts.has(contact.telp)}
                                onCheckedChange={(checked) => handleContactSelection(contact.telp, checked as boolean)}
                                aria-label={`Select ${contact.fullname}`}
                                className="w-3 h-3 sm:w-4 sm:h-4"
                              />
                            </TableCell>
                            <TableCell className="font-medium text-[10px] sm:text-xs py-2 sm:py-3">{contact.fullname}</TableCell>
                            <TableCell className="text-muted-foreground text-[10px] sm:text-xs py-2 sm:py-3">{contact.telp}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination Navigation */}
              {filteredContacts.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3 sm:mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                  >
                    First
                  </Button>

                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (pageNumber > totalPages) return null;

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 p-0 text-[8px] sm:text-[10px]"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                  >
                    Last
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="w-[95vw] max-w-sm sm:max-w-md">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-sm sm:text-base">Delete Selected Contacts</DialogTitle>
            <DialogDescription className="text-[10px] sm:text-xs md:text-sm">
              Are you sure you want to delete {selectedContacts.size} selected contact{selectedContacts.size !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletingContacts}
              className="h-8 sm:h-9 text-[10px] sm:text-xs"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={bulkDeleteContacts}
              disabled={deletingContacts}
              className="h-8 sm:h-9 text-[10px] sm:text-xs"
            >
              {deletingContacts ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Delete {selectedContacts.size} Contact{selectedContacts.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </SubscriptionGuard>
  );
}
