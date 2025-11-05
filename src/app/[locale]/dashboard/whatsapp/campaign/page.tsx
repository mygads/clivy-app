'use client';

// WhatsApp Campaign Page - Enhanced with CSV Import and Multiple Message Types
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertCircle,
  CheckCircle,
  Send,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Upload,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Download,
  Plus,
  X,
  FileText,
  Database,
  Copy,
  ExternalLink,
  Smartphone,
  Wifi,
  WifiOff,
  History,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Mic,
  Video,
  MapPin,
  Contact,
  Layout,
  FileUp,
  List,
  Keyboard
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SessionManager } from '@/lib/storage';
import SubscriptionGuard from '@/components/whatsapp/subscription-guard';

// Timezone data with major cities
const TIMEZONES = [
  // Asia
  { value: 'Asia/Jakarta', label: 'Jakarta, Indonesia (WIB)', offset: '+07:00', utcOffset: 7 },
  { value: 'Asia/Makassar', label: 'Makassar, Indonesia (WITA)', offset: '+08:00', utcOffset: 8 },
  { value: 'Asia/Jayapura', label: 'Jayapura, Indonesia (WIT)', offset: '+09:00', utcOffset: 9 },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: '+08:00', utcOffset: 8 },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur, Malaysia (MYT)', offset: '+08:00', utcOffset: 8 },
  { value: 'Asia/Bangkok', label: 'Bangkok, Thailand (ICT)', offset: '+07:00', utcOffset: 7 },
  { value: 'Asia/Manila', label: 'Manila, Philippines (PHT)', offset: '+08:00', utcOffset: 8 },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City, Vietnam (ICT)', offset: '+07:00', utcOffset: 7 },
  { value: 'Asia/Tokyo', label: 'Tokyo, Japan (JST)', offset: '+09:00', utcOffset: 9 },
  { value: 'Asia/Seoul', label: 'Seoul, South Korea (KST)', offset: '+09:00', utcOffset: 9 },
  { value: 'Asia/Shanghai', label: 'Shanghai, China (CST)', offset: '+08:00', utcOffset: 8 },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: '+08:00', utcOffset: 8 },
  { value: 'Asia/Taipei', label: 'Taipei, Taiwan (CST)', offset: '+08:00', utcOffset: 8 },
  { value: 'Asia/Kolkata', label: 'Mumbai/Delhi, India (IST)', offset: '+05:30', utcOffset: 5.5 },
  { value: 'Asia/Dubai', label: 'Dubai, UAE (GST)', offset: '+04:00', utcOffset: 4 },
  { value: 'Asia/Riyadh', label: 'Riyadh, Saudi Arabia (AST)', offset: '+03:00', utcOffset: 3 },
  
  // Europe
  { value: 'Europe/London', label: 'London, UK (GMT/BST)', offset: '+00:00/+01:00', utcOffset: 0 },
  { value: 'Europe/Berlin', label: 'Berlin, Germany (CET/CEST)', offset: '+01:00/+02:00', utcOffset: 1 },
  { value: 'Europe/Paris', label: 'Paris, France (CET/CEST)', offset: '+01:00/+02:00', utcOffset: 1 },
  { value: 'Europe/Rome', label: 'Rome, Italy (CET/CEST)', offset: '+01:00/+02:00', utcOffset: 1 },
  { value: 'Europe/Madrid', label: 'Madrid, Spain (CET/CEST)', offset: '+01:00/+02:00', utcOffset: 1 },
  { value: 'Europe/Amsterdam', label: 'Amsterdam, Netherlands (CET/CEST)', offset: '+01:00/+02:00', utcOffset: 1 },
  { value: 'Europe/Zurich', label: 'Zurich, Switzerland (CET/CEST)', offset: '+01:00/+02:00', utcOffset: 1 },
  { value: 'Europe/Moscow', label: 'Moscow, Russia (MSK)', offset: '+03:00', utcOffset: 3 },
  
  // Americas
  { value: 'America/New_York', label: 'New York, USA (EST/EDT)', offset: '-05:00/-04:00', utcOffset: -5 },
  { value: 'America/Chicago', label: 'Chicago, USA (CST/CDT)', offset: '-06:00/-05:00', utcOffset: -6 },
  { value: 'America/Denver', label: 'Denver, USA (MST/MDT)', offset: '-07:00/-06:00', utcOffset: -7 },
  { value: 'America/Los_Angeles', label: 'Los Angeles, USA (PST/PDT)', offset: '-08:00/-07:00', utcOffset: -8 },
  { value: 'America/Toronto', label: 'Toronto, Canada (EST/EDT)', offset: '-05:00/-04:00', utcOffset: -5 },
  { value: 'America/Vancouver', label: 'Vancouver, Canada (PST/PDT)', offset: '-08:00/-07:00', utcOffset: -8 },
  { value: 'America/Mexico_City', label: 'Mexico City, Mexico (CST/CDT)', offset: '-06:00/-05:00', utcOffset: -6 },
  { value: 'America/Sao_Paulo', label: 'São Paulo, Brazil (BRT/BRST)', offset: '-03:00/-02:00', utcOffset: -3 },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires, Argentina (ART)', offset: '-03:00', utcOffset: -3 },
  
  // Oceania
  { value: 'Australia/Sydney', label: 'Sydney, Australia (AEST/AEDT)', offset: '+10:00/+11:00', utcOffset: 10 },
  { value: 'Australia/Melbourne', label: 'Melbourne, Australia (AEST/AEDT)', offset: '+10:00/+11:00', utcOffset: 10 },
  { value: 'Australia/Perth', label: 'Perth, Australia (AWST)', offset: '+08:00', utcOffset: 8 },
  { value: 'Pacific/Auckland', label: 'Auckland, New Zealand (NZST/NZDT)', offset: '+12:00/+13:00', utcOffset: 12 },
  
  // Africa
  { value: 'Africa/Lagos', label: 'Lagos, Nigeria (WAT)', offset: '+01:00', utcOffset: 1 },
  { value: 'Africa/Cairo', label: 'Cairo, Egypt (EET/EEST)', offset: '+02:00/+03:00', utcOffset: 2 },
  { value: 'Africa/Johannesburg', label: 'Johannesburg, South Africa (SAST)', offset: '+02:00', utcOffset: 2 },
  
  // UTC
  { value: 'UTC', label: 'UTC (Universal Coordinated Time)', offset: '+00:00', utcOffset: 0 },
];

// Get timezone info
const getTimezoneInfo = (timezone: string) => {
  return TIMEZONES.find(tz => tz.value === timezone) || TIMEZONES[0];
};

interface Contact {
  telp: string;
  fullname: string;
  selected?: boolean;
}

interface Campaign {
  id: number;
  user_id: string;
  name: string;
  type: 'text' | 'image' | 'audio' | 'document' | 'video' | 'location' | 'contact' | 'template';
  status: 'active' | 'inactive' | 'archived';
  message_body?: string;
  image_url?: string;
  image_base64?: string;
  caption?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

interface BulkCampaign {
  id: number;
  campaign_id: number;
  name: string;
  type: 'text' | 'image';
  status: 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed';
  total_count: number;
  sent_count: number;
  failed_count: number;
  scheduled_at?: string;
  processed_at?: string;
  completed_at?: string;
  created_at: string;
  message_body?: string;
  campaign?: {
    id: number;
    name: string;
    type: string;
  };
}

interface BulkCampaignDetail {
  bulk_campaign: BulkCampaign;
  items: BulkCampaignItem[];
}

interface BulkCampaignItem {
  id: number;
  bulk_campaign_id: number;
  phone: string;
  status: 'sent' | 'failed' | 'pending';
  message_id: string;
  sent_at?: string;
  error_message: string;
}

interface CampaignFormData {
  name: string;
  type: 'text' | 'image' | 'audio' | 'document' | 'video' | 'location' | 'contact' | 'template';
  messageBody: string;
  imageUrl: string;
  imageCaption: string;
  audioBase64: string;
  documentBase64: string;
  documentFileName: string;
  videoBase64: string;
  videoCaption: string;
  locationName: string;
  latitude: string;
  longitude: string;
  contactName: string;
  contactPhone: string;
  contactVcard: string;
  templateContent: string;
  templateFooter: string;
  templateButtons: { DisplayText: string; Type: string }[];
  status: 'active' | 'inactive' | 'archived';
}

interface BulkCampaignFormData {
  campaignId: number | null;
  name: string;
  selectedContacts: string[];
  scheduleType: 'now' | 'later';
  scheduleDate: string;
  scheduleTime: string;
  timezone: string;
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

export default function BulkMessagePage() {
  const t = useTranslations('dashboard.whatsapp.bulk');
  
  // Session state
  const [sessionsData, setSessionsData] = useState<SessionsData | null>(null);
    const [selectedSession, setSelectedSession] = useState<WhatsAppSession | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [bulkHistory, setBulkHistory] = useState<BulkCampaign[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Campaign management state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignFormData, setCampaignFormData] = useState<CampaignFormData>({
    name: '',
    type: 'text',
    messageBody: '',
    imageUrl: '',
    imageCaption: '',
    audioBase64: '',
    documentBase64: '',
    documentFileName: '',
    videoBase64: '',
    videoCaption: '',
    locationName: '',
    latitude: '',
    longitude: '',
    contactName: '',
    contactPhone: '',
    contactVcard: '',
    templateContent: '',
    templateFooter: '',
    templateButtons: [{ DisplayText: '', Type: 'quickreply' }],
    status: 'active'
  });
  
  // Bulk campaign execution state
  const [bulkCampaignFormData, setBulkCampaignFormData] = useState<BulkCampaignFormData>({
    campaignId: null,
    name: '',
    selectedContacts: [],
    scheduleType: 'now',
    scheduleDate: '',
    scheduleTime: '',
    timezone: 'Asia/Jakarta' // Default to Jakarta WIB (UTC+7)
  });
  
  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [excelContacts, setExcelContacts] = useState<Contact[]>([]);
  
  // File processing states for campaign creation
  const [processingImage, setProcessingImage] = useState(false);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [processingDocument, setProcessingDocument] = useState(false);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [processingSticker, setProcessingSticker] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Contact source toggle
  const [contactSource, setContactSource] = useState<'database' | 'import' | 'manual'>('database');
  const [manualNumbers, setManualNumbers] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Campaign dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Campaign details state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState<BulkCampaignDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Pagination state
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignPageSize] = useState(10);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize] = useState(10);

  useEffect(() => {
    // Set default date/time for bulk campaign execution using local timezone
    const now = new Date();
    
    // Get local date in YYYY-MM-DD format
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayLocal = `${year}-${month}-${day}`;
    
    // Get local time in HH:MM format
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const nowLocal = `${hours}:${minutes}`;
    
    setBulkCampaignFormData(prev => ({
      ...prev,
      scheduleDate: todayLocal,
      scheduleTime: nowLocal
    }));
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

  // Campaign Management Functions
  const fetchCampaigns = useCallback(async () => {
    const jwtToken = SessionManager.getToken();
    if (!jwtToken) {
      setError('Authentication required');
      return;
    }
    
    setCampaignsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API}/bulk/campaign`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data || []);
      } else {
        throw new Error('Failed to fetch campaigns');
      }
    } catch (err) {
      setError('Failed to load campaigns');
      console.error('Fetch campaigns error:', err);
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  // Fetch campaigns when session changes
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Load contacts on mount
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  

  const createCampaign = async () => {
    const jwtToken = SessionManager.getToken();
    
    const { name, type, messageBody, imageUrl, imageCaption, status } = campaignFormData;
    
    if (!name.trim()) {
      setError('Campaign name is required');
      return;
    }
    
    if (type === 'text' && !messageBody.trim()) {
      setError('Message body is required for text campaigns');
      return;
    }
    if (type === 'image') {
      if (!imageUrl.trim()) {
        setError('Image URL is required for image campaigns');
        return;
      }
      const sanitizedUrl = imageUrl.split('?')[0].split('#')[0];
      if (!/\.(png|jpe?g)$/i.test(sanitizedUrl)) {
        setError('Only PNG, JPG, or JPEG image URLs are allowed');
        return;
      }
    }

    setLoading(true);
    try {
      const requestBody: any = {
        name: name.trim(),
        type,
        status
      };
      
      if (type === 'text') {
        requestBody.message_body = messageBody.trim();
      } else if (type === 'image') {
        requestBody.image_url = imageUrl.trim();
        if (imageCaption.trim()) {
          requestBody.caption = imageCaption.trim();
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API}/bulk/campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Campaign created successfully');
        fetchCampaigns(); // Refresh campaigns list
        resetCampaignForm();
        setCreateDialogOpen(false); // Close dialog
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
      console.error('Create campaign error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async () => {
    const jwtToken = SessionManager.getToken();
    if (!jwtToken || !editingCampaign) {
      setError('Authentication required or no campaign selected');
      return;
    }
    
    const { name, messageBody, imageUrl, imageCaption, status } = campaignFormData;
    if (editingCampaign.type === 'image') {
      if (!imageUrl.trim()) {
        setError('Image URL is required for image campaigns');
        return;
      }
      const sanitizedUrl = imageUrl.split('?')[0].split('#')[0];
      if (!/\.(png|jpe?g)$/i.test(sanitizedUrl)) {
        setError('Only PNG, JPG, or JPEG image URLs are allowed');
        return;
      }
    }

    setLoading(true);
    try {
      const requestBody: any = {
        name: name.trim(),
        status
      };
      
      if (editingCampaign.type === 'text') {
        requestBody.message_body = messageBody.trim();
      } else if (editingCampaign.type === 'image') {
        requestBody.image_url = imageUrl.trim();
        if (imageCaption.trim()) {
          requestBody.caption = imageCaption.trim();
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API}/bulk/campaign/${editingCampaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setSuccess('Campaign updated successfully');
        fetchCampaigns(); // Refresh campaigns list
        setEditingCampaign(null);
        resetCampaignForm();
        setCreateDialogOpen(false); // Close dialog
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
      console.error('Update campaign error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: number) => {
    const jwtToken = SessionManager.getToken();
    if (!jwtToken) {
      setError('Authentication required');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API}/bulk/campaign/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        setSuccess('Campaign deleted successfully');
        fetchCampaigns(); // Refresh campaigns list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
      console.error('Delete campaign error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetCampaignForm = () => {
    setCampaignFormData({
      name: '',
      type: 'text',
      messageBody: '',
      imageUrl: '',
      imageCaption: '',
      audioBase64: '',
      documentBase64: '',
      documentFileName: '',
      videoBase64: '',
      videoCaption: '',
      locationName: '',
      latitude: '',
      longitude: '',
      contactName: '',
      contactPhone: '',
      contactVcard: '',
      templateContent: '',
      templateFooter: '',
      templateButtons: [{ DisplayText: '', Type: 'quickreply' }],
      status: 'active'
    });
    // Clear file states
    setImageFile(null);
    setAudioFile(null);
    setDocumentFile(null);
    setVideoFile(null);
  };

  const editCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignFormData({
      name: campaign.name,
      type: campaign.type,
      messageBody: campaign.message_body || '',
      imageUrl: campaign.image_url || '',
      imageCaption: campaign.caption || '',
      audioBase64: '',
      documentBase64: '',
      documentFileName: '',
      videoBase64: '',
      videoCaption: '',
      locationName: '',
      latitude: '',
      longitude: '',
      contactName: '',
      contactPhone: '',
      contactVcard: '',
      templateContent: '',
      templateFooter: '',
      templateButtons: [{ DisplayText: '', Type: 'quickreply' }],
      status: campaign.status
    });
    setCreateDialogOpen(true);
  };

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
  const fetchSessions = useCallback(async () => {
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
  }, []);

  // Handle contact selection
  const toggleContactSelection = (telp: string) => {
    setBulkCampaignFormData(prev => ({
      ...prev,
      selectedContacts: prev.selectedContacts.includes(telp)
        ? prev.selectedContacts.filter(c => c !== telp)
        : [...prev.selectedContacts, telp]
    }));
  };

  // Handle select all
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const filteredContacts = contacts.filter(contact =>
      contact.fullname.toLowerCase().includes(filterText.toLowerCase()) ||
      contact.telp.includes(filterText)
    );
    
    setBulkCampaignFormData(prev => ({
      ...prev,
      selectedContacts: newSelectAll ? filteredContacts.map(c => c.telp) : []
    }));
  };



  // Copy to clipboard utility
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate cURL for testing
  const generateCurl = () => {
    const jwtToken = SessionManager.getToken();
    if (!jwtToken || !bulkCampaignFormData.campaignId) return '';
    
    const selectedCampaign = campaigns.find(c => c.id === bulkCampaignFormData.campaignId);
    if (!selectedCampaign) return '';
    
    const phoneNumbers = getAllSelectedPhones();
    const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API;

    return `curl -X POST ${baseUrl}/bulk/campaign/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${jwtToken}" \\
  -d '{
    "campaign_id": ${selectedCampaign.id},
    "name": "${bulkCampaignFormData.name}",
    "phone": [${phoneNumbers.map(p => `"${p}"`).join(', ')}],
    "send_sync": "${bulkCampaignFormData.scheduleType}",
    ${bulkCampaignFormData.scheduleType === 'later' ? `"scheduled_at": "${new Date(`${bulkCampaignFormData.scheduleDate}T${bulkCampaignFormData.scheduleTime}`).toISOString()}",` : ''}
  }'`;
  };

  // Fetch message history
  const fetchBulkHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setError(null);
      
      const jwtToken = SessionManager.getToken();
      if (!jwtToken) {
        setBulkHistory([]);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API;
      const response = await fetch(`${baseUrl}/bulk/campaigns`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Campaign history not available');
          setBulkHistory([]);
          return;
        }
        throw new Error(`Failed to fetch history: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch history');
      }

      setBulkHistory(result.data || []);
    } catch (err) {
      console.error('Fetch history error:', err);
      if (err instanceof Error && !err.message.includes('404')) {
        setError(err.message.includes('Failed to fetch') 
          ? 'History server is not available.'
          : err.message
        );
      }
      setBulkHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Fetch campaign details
  const fetchCampaignDetails = useCallback(async (campaignId: number) => {
    try {
      setDetailsLoading(true);
      setError(null);
      
      const jwtToken = SessionManager.getToken();
      if (!jwtToken) {
        throw new Error('Authentication required');
      }

      const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API;
      const response = await fetch(`${baseUrl}/bulk/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch campaign details: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch campaign details');
      }

      setSelectedCampaignDetails(result.data);
      setDetailsDialogOpen(true);
    } catch (err) {
      console.error('Fetch campaign details error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign details');
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  // Delete bulk campaign (scheduled or pending campaigns)
  const deleteBulkCampaign = async (bulkCampaignId: number) => {
    if (!confirm('Are you sure you want to delete this broadcast campaign? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const jwtToken = SessionManager.getToken();
      if (!jwtToken) {
        throw new Error('Authentication required');
      }

      const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API;
      const response = await fetch(`${baseUrl}/bulk/campaigns/${bulkCampaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete broadcast campaign');
      }

      const result = await response.json();
      setSuccess(result.message || 'Broadcast campaign deleted successfully');
      
      // Refresh history
      fetchBulkHistory();
    } catch (err) {
      console.error('Delete bulk campaign error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete broadcast campaign');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    // Fetch sessions on mount
    fetchSessions();
    
    // Fetch bulk history on mount
    fetchBulkHistory();
  }, [fetchSessions, fetchBulkHistory]);

  // Handle Excel file upload
  const handleExcelUpload = useCallback((file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setError(t('messages.invalidExcelFile'));
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
                  selected: true // Auto-select all imported contacts
                });
              }
            }
          });
          
          setExcelContacts(contacts);
          setSuccess(t('messages.importSuccess', { count: contacts.length.toString() }));
          
          // Auto-select all imported numbers
          const importedPhones = contacts.map(c => c.telp);
          setBulkCampaignFormData(prev => ({
            ...prev,
            selectedContacts: [...new Set([...prev.selectedContacts, ...importedPhones])]
          }));
          
          setImportDialogOpen(false);
          setTimeout(() => setSuccess(null), 3000);
        } else {
          // Handle Excel files - for now just show error as we need xlsx library
          setError(t('messages.excelNotSupported'));
        }
      } catch (err) {
        console.error('File parsing error:', err);
        setError(t('messages.parseError'));
      } finally {
        setUploadingExcel(false);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, [t]);

  // Toggle excel contact selection
  const toggleExcelContactSelection = (telp: string) => {
    setExcelContacts(prev => prev.map(contact => 
      contact.telp === telp 
        ? { ...contact, selected: !contact.selected }
        : contact
    ));
  };

  // File upload handlers for campaign creation
  const handleCampaignImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setProcessingImage(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCampaignFormData(prev => ({ ...prev, imageUrl: base64 }));
        setProcessingImage(false);
      };
      reader.onerror = () => {
        setProcessingImage(false);
        setError('Failed to process image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCampaignAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setProcessingAudio(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCampaignFormData(prev => ({ ...prev, audioBase64: base64 }));
        setProcessingAudio(false);
      };
      reader.onerror = () => {
        setProcessingAudio(false);
        setError('Failed to process audio file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCampaignDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setProcessingDocument(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCampaignFormData(prev => ({ 
          ...prev, 
          documentBase64: base64,
          documentFileName: file.name
        }));
        setProcessingDocument(false);
      };
      reader.onerror = () => {
        setProcessingDocument(false);
        setError('Failed to process document file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCampaignVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setProcessingVideo(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCampaignFormData(prev => ({ ...prev, videoBase64: base64 }));
        setProcessingVideo(false);
      };
      reader.onerror = () => {
        setProcessingVideo(false);
        setError('Failed to process video file');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle location selection from map
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setCampaignFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
  }, []);

  // Parse manual numbers
  const parseManualNumbers = () => {
    if (!manualNumbers.trim()) {
      setError('Please enter at least one phone number');
      return;
    }

    // Split by comma, newline, or semicolon
    const numbers = manualNumbers
      .split(/[,;\n]/)
      .map(num => num.trim().replace(/[^\d+]/g, ''))
      .filter(num => num && (num.startsWith('+') || num.length >= 8));

    if (numbers.length === 0) {
      setError('No valid phone numbers found');
      return;
    }

    // Add to selected contacts
    setBulkCampaignFormData(prev => ({
      ...prev,
      selectedContacts: [...new Set([...prev.selectedContacts, ...numbers])]
    }));

    setSuccess(`Added ${numbers.length} phone number(s)`);
    setManualNumbers('');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Get all selected phone numbers
  const getAllSelectedPhones = () => {
    return bulkCampaignFormData.selectedContacts;
  };

  // Execute bulk campaign
  const executeBulkCampaign = async () => {
    try {
      setSending(true);
      setError(null);
      
      const jwtToken = SessionManager.getToken();
      if (!jwtToken) {
        throw new Error('Authentication required');
      }

      if (!bulkCampaignFormData.campaignId) {
        throw new Error('Please select a campaign to execute');
      }

      const phoneNumbers = getAllSelectedPhones();
      
      if (phoneNumbers.length === 0) {
        throw new Error('Please select at least one contact');
      }

      if (!bulkCampaignFormData.name.trim()) {
        throw new Error('Bulk campaign name is required');
      }

      // Prepare scheduled time with timezone according to API spec
      let scheduledTime;
      let timezoneOffset;
      
      if (bulkCampaignFormData.scheduleType === 'later') {
        // Validate date and time are not empty
        if (!bulkCampaignFormData.scheduleDate || !bulkCampaignFormData.scheduleTime) {
          throw new Error('Please select both date and time for scheduled campaign');
        }

        console.log('=== TIMEZONE HANDLING DEBUG ===');
        console.log('User Input:');
        console.log(`  Date: ${bulkCampaignFormData.scheduleDate}`);
        console.log(`  Time: ${bulkCampaignFormData.scheduleTime}`);
        console.log(`  Timezone: ${bulkCampaignFormData.timezone}`);
        
        // Get timezone info
        const tzInfo = getTimezoneInfo(bulkCampaignFormData.timezone);
        console.log(`  Timezone Offset: ${tzInfo.offset}`);
        
        // Format: "YYYY-MM-DD HH:MM:SS" (raw local time)
        scheduledTime = `${bulkCampaignFormData.scheduleDate} ${bulkCampaignFormData.scheduleTime}:00`;
        
        // Validate scheduled time is in the future
        // Create Date object in the selected timezone
        const scheduledDateTime = new Date(`${bulkCampaignFormData.scheduleDate}T${bulkCampaignFormData.scheduleTime}:00`);
        const now = new Date();
        
        if (scheduledDateTime <= now) {
          throw new Error('Scheduled time must be in the future. Please select a later date/time.');
        }
        
        // Send timezone offset (e.g., "+07:00") - take first offset for DST zones
        timezoneOffset = tzInfo.offset.split('/')[0];
        
        console.log('Server Request:');
        console.log(`  send_sync: ${scheduledTime}`);
        console.log(`  timezone: ${timezoneOffset}`);
        console.log(`  Expected execution: ${scheduledTime} in ${tzInfo.label}`);
        console.log('=== END DEBUG ===');
      }

      const requestBody: any = {
        campaign_id: bulkCampaignFormData.campaignId,
        name: bulkCampaignFormData.name.trim(),
        phone: phoneNumbers,
        send_sync: bulkCampaignFormData.scheduleType === 'now' 
          ? 'now' 
          : scheduledTime,
        ...(bulkCampaignFormData.scheduleType === 'later' && {
          timezone: timezoneOffset
        })
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_WHATSAPP_BULK_SERVER_API}/bulk/campaign/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const statusText = bulkCampaignFormData.scheduleType === 'now' ? 'Campaign executed successfully' : 'Campaign scheduled successfully';
        setSuccess(`${statusText}. Bulk campaign ID: ${data.data.bulk_campaign_id}`);
        
        // Reset bulk campaign form
        setBulkCampaignFormData(prev => ({
          ...prev,
          campaignId: null,
          name: '',
          selectedContacts: []
        }));
        setSelectAll(false);
        
        // Refresh history
        fetchBulkHistory();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to execute campaign');
      }
    } catch (err) {
      console.error('Execute bulk campaign error:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute campaign');
    } finally {
      setSending(false);
    }
  };

  // Pagination helpers
  const getTotalCampaignPages = () => Math.ceil(campaigns.length / campaignPageSize);
  const getTotalHistoryPages = () => Math.ceil(bulkHistory.length / historyPageSize);
  
  const getPaginatedCampaigns = () => {
    const startIndex = (campaignPage - 1) * campaignPageSize;
    const endIndex = startIndex + campaignPageSize;
    return campaigns.slice(startIndex, endIndex);
  };
  
  const getPaginatedHistory = () => {
    const startIndex = (historyPage - 1) * historyPageSize;
    const endIndex = startIndex + historyPageSize;
    return bulkHistory.slice(startIndex, endIndex);
  };

  // Filtered contacts
  const filteredContacts = contacts.filter(contact =>
    contact.fullname.toLowerCase().includes(filterText.toLowerCase()) ||
    contact.telp.includes(filterText)
  );

  return (
    <SubscriptionGuard featureName="WhatsApp Campaign" showRefreshButton={true}>
      <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-8 pt-3 sm:pt-4 md:pt-6 bg-background">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1">
          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{getAllSelectedPhones().length} selected</span>
        </Badge>
      </div>

      {/* WhatsApp Session Selection */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <span className="text-sm sm:text-base">WhatsApp Session</span>
            </div>
            <Button
              onClick={fetchSessions}
              disabled={sessionsLoading}
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
            >
              {sessionsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2 sm:hidden">Refresh Sessions</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading sessions...
            </span>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {getAvailableSessions().length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Smartphone className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3" />
                <p className="text-sm sm:text-base text-muted-foreground mb-2">
                  {sessionsData?.sessions.length === 0 
                    ? 'No WhatsApp sessions found'
                    : 'No logged-in WhatsApp sessions available'
                  }
                </p>
                <Link 
                  href="/dashboard/whatsapp/devices"
                  className="text-primary hover:underline font-medium text-sm sm:text-base"
                >
                  Manage Sessions
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Select WhatsApp Session
                </Label>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {getAvailableSessions().map((session) => (
                    <div 
                      key={session.id} 
                      className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:border-primary/50 ${
                        selectedSession?.id === session.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                      onClick={() => handleSessionChange(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <input
                            type="radio"
                            id={session.id}
                            name="whatsapp-session"
                            value={session.id}
                            checked={selectedSession?.id === session.id}
                            onChange={(e) => handleSessionChange(e.target.value)}
                            className="h-4 w-4 text-primary focus:ring-primary flex-shrink-0"
                          />
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <Smartphone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-sm font-medium block truncate">
                                {session.sessionName}
                              </span>
                                {session.jid && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {session.jid.replace('@s.whatsapp.net', '').split(':')[0]}
                                </div>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                          {session.loggedIn ? (
                            <div className="flex items-center space-x-1">
                              <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs px-1.5 py-0.5">
                                Connected
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
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
          <AlertDescription className="text-green-700 text-sm">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6">

        {/* Show message if no campaign templates exist */}
        {!campaignsLoading && campaigns.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6 pb-6">
              <div className="text-center py-8">
                <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Campaign Templates Available</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You need to create at least one campaign template before you can execute bulk campaigns. 
                  Campaign templates define the message content that will be sent to your recipients.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button
                    onClick={() => {
                      setEditingCampaign(null);
                      resetCampaignForm();
                      setCreateDialogOpen(true);
                    }}
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Template
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  >
                    <Database className="w-5 h-5 mr-2" />
                    View Templates Section
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Only show campaign execution UI if templates exist */}
        {campaigns.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-8 gap-4 sm:gap-6">
          {/* Left Column: Contacts - Takes 3 columns on XL+ */}
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
            {/* Contact Source Selection */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Select Recipients</span>
                  </div>
                  <Link href="/dashboard/whatsapp/contacts">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {/* Contact Source Tabs */}
                  <Tabs value={contactSource} onValueChange={(value: any) => setContactSource(value)}>
                    <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11">
                      <TabsTrigger value="database" className="text-xs sm:text-sm">
                        <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Database</span>
                        <span className="sm:hidden">DB</span>
                      </TabsTrigger>
                      <TabsTrigger value="import" className="text-xs sm:text-sm">
                        <FileUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Import CSV</span>
                        <span className="sm:hidden">CSV</span>
                      </TabsTrigger>
                      <TabsTrigger value="manual" className="text-xs sm:text-sm">
                        <Keyboard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Manual</span>
                        <span className="sm:hidden">Text</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Database Contacts Tab */}
                    <TabsContent value="database" className="space-y-3 mt-4">
                      <div className="space-y-3">
                        <Input
                          placeholder="Search contacts..."
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                          className="text-sm"
                        />
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="selectAll"
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                          />
                          <Label htmlFor="selectAll" className="text-sm cursor-pointer">
                            Select All ({filteredContacts.length} contacts)
                          </Label>
                        </div>
                      </div>

                      <div className="max-h-80 sm:max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2 sm:p-3">
                        {contactsLoading ? (
                          <div className="flex items-center justify-center py-6 sm:py-8">
                            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                            <span className="ml-2 text-sm">Loading contacts...</span>
                          </div>
                        ) : filteredContacts.length === 0 ? (
                          <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                            {!selectedSession 
                              ? 'Please select a WhatsApp session first to load contacts'
                              : 'No contacts found'
                            }
                          </div>
                        ) : (
                          filteredContacts.map((contact) => (
                            <div key={contact.telp} className="flex items-center space-x-2 p-2 hover:bg-muted rounded min-w-0">
                              <Checkbox
                                id={contact.telp}
                                checked={bulkCampaignFormData.selectedContacts.includes(contact.telp)}
                                onCheckedChange={() => toggleContactSelection(contact.telp)}
                                className="flex-shrink-0"
                              />
                              <Label htmlFor={contact.telp} className="flex-1 cursor-pointer min-w-0">
                                <div className="font-medium text-sm truncate">{contact.fullname}</div>
                                <div className="text-xs text-muted-foreground truncate">{contact.telp}</div>
                              </Label>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    {/* Import CSV Tab */}
                    <TabsContent value="import" className="space-y-3 mt-4">
                      <div className="space-y-3">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <FileUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                          <Label htmlFor="csv-upload" className="cursor-pointer">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Upload CSV or Excel File</p>
                              <p className="text-xs text-muted-foreground">
                                Click to browse or drag and drop your file here
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Format: phone,name (one per line)
                              </p>
                            </div>
                          </Label>
                          <Input
                            id="csv-upload"
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleExcelUpload(file);
                            }}
                            className="hidden"
                          />
                          {uploadingExcel && (
                            <div className="mt-3 flex items-center justify-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Processing file...</span>
                            </div>
                          )}
                        </div>

                        {/* Imported Contacts Preview */}
                        {excelContacts.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Imported Contacts ({excelContacts.filter(c => c.selected).length} selected)
                            </Label>
                            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                              {excelContacts.map((contact) => (
                                <div key={contact.telp} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                                  <Checkbox
                                    checked={bulkCampaignFormData.selectedContacts.includes(contact.telp)}
                                    onCheckedChange={() => toggleContactSelection(contact.telp)}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{contact.fullname}</div>
                                    <div className="text-xs text-muted-foreground truncate">{contact.telp}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setExcelContacts([]);
                                setBulkCampaignFormData(prev => ({
                                  ...prev,
                                  selectedContacts: prev.selectedContacts.filter(
                                    phone => !excelContacts.map(c => c.telp).includes(phone)
                                  )
                                }));
                              }}
                              className="w-full"
                            >
                              Clear Imported Contacts
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Manual Input Tab */}
                    <TabsContent value="manual" className="space-y-3 mt-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Enter Phone Numbers</Label>
                        <Textarea
                          placeholder="Enter phone numbers separated by comma, semicolon, or new line&#10;Example:&#10;6281234567890&#10;6281234567891, 6281234567892"
                          value={manualNumbers}
                          onChange={(e) => setManualNumbers(e.target.value)}
                          rows={8}
                          className="text-sm font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          📱 Include country code (e.g., 62 for Indonesia, 1 for US)
                        </p>
                        <Button
                          onClick={parseManualNumbers}
                          disabled={!manualNumbers.trim()}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Numbers to Recipients
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Selected Count Display */}
                  {bulkCampaignFormData.selectedContacts.length > 0 && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            {bulkCampaignFormData.selectedContacts.length} recipient(s) selected
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setBulkCampaignFormData(prev => ({ ...prev, selectedContacts: [] }));
                            setSelectAll(false);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column: Campaign Selection & Execution - Takes 3 columns on XL+ */}
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
            {/* Campaign Selection */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Select Campaign</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                {/* Campaign Selection */}
                <div>
                  <Label className="text-sm font-medium">Campaign Template</Label>
                  <Select 
                    value={bulkCampaignFormData.campaignId?.toString() || ''} 
                    onValueChange={(value) => 
                      setBulkCampaignFormData(prev => ({ ...prev, campaignId: value ? parseInt(value) : null }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a campaign template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.filter(c => c.status === 'active').map(campaign => (
                        <SelectItem key={campaign.id} value={campaign.id.toString()}>
                          <div className="flex items-center space-x-2">
                            {campaign.type === 'text' ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : (
                              <ImageIcon className="w-4 h-4" />
                            )}
                            <span className="truncate">{campaign.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Campaign Preview */}
                {bulkCampaignFormData.campaignId && (
                  <div className="border rounded-lg p-3 sm:p-4 bg-muted/50">
                    {(() => {
                      const selectedCampaign = campaigns.find(c => c.id === bulkCampaignFormData.campaignId);
                      if (!selectedCampaign) return null;
                      
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <Badge variant="outline" className="flex-shrink-0 text-xs">
                              {selectedCampaign.type === 'text' ? 'Text' : 'Image'}
                            </Badge>
                            <span className="font-medium text-sm truncate">{selectedCampaign.name}</span>
                          </div>
                          {selectedCampaign.type === 'text' && selectedCampaign.message_body && (
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {selectedCampaign.message_body.substring(0, 150)}
                              {selectedCampaign.message_body.length > 150 && '...'}
                            </div>
                          )}
                          {selectedCampaign.type === 'image' && (
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Caption
                              {selectedCampaign.caption && `: ${selectedCampaign.caption.substring(0, 100)}${selectedCampaign.caption.length > 100 ? '...' : ''}`}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Bulk Campaign Name */}
                <div>
                  <Label htmlFor="bulkCampaignName" className="flex items-center space-x-1 text-sm font-medium">
                    <span>Execution Name</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bulkCampaignName"
                    placeholder="e.g., Welcome Campaign Jan 2024"
                    value={bulkCampaignFormData.name}
                    onChange={(e) => setBulkCampaignFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`mt-2 text-sm ${!bulkCampaignFormData.name.trim() ? "border-red-300 focus:border-red-500" : ""}`}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Give this execution a descriptive name for tracking
                  </div>
                  {!bulkCampaignFormData.name.trim() && (
                    <div className="text-xs text-red-500 mt-1">
                      Execution name is required
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Configuration */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Schedule Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                {/* Schedule Type */}
                <div>
                  <Label className="text-sm font-medium">Send Schedule</Label>
                  <Select 
                    value={bulkCampaignFormData.scheduleType} 
                    onValueChange={(value: 'now' | 'later') => 
                      setBulkCampaignFormData(prev => ({ ...prev, scheduleType: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Execute Now</SelectItem>
                      <SelectItem value="later">Schedule for Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Schedule Date & Time */}
                {bulkCampaignFormData.scheduleType === 'later' && (
                  <div className="space-y-3">
                    {/* Timezone Selection */}
                    <div>
                      <Label className="text-sm font-medium">Timezone</Label>
                      <Select 
                        value={bulkCampaignFormData.timezone} 
                        onValueChange={(value) => 
                          setBulkCampaignFormData(prev => ({ ...prev, timezone: value }))
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {TIMEZONES.map(timezone => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              <div className="flex flex-col">
                                <span className="font-medium text-xs">{timezone.label}</span>
                                <span className="text-[10px] text-muted-foreground">UTC{timezone.offset}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground mt-1">
                        Select the timezone for scheduling. Default is Jakarta (WIB UTC+7).
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="scheduleDate" className="text-sm font-medium">Date</Label>
                        <Input
                          id="scheduleDate"
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={bulkCampaignFormData.scheduleDate}
                          onChange={(e) => setBulkCampaignFormData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                          className="mt-2 text-sm"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Must be today or later
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="scheduleTime" className="text-sm font-medium">
                          Time ({getTimezoneInfo(bulkCampaignFormData.timezone).offset})
                        </Label>
                        <Input
                          id="scheduleTime"
                          type="time"
                          value={bulkCampaignFormData.scheduleTime}
                          onChange={(e) => setBulkCampaignFormData(prev => ({ ...prev, scheduleTime: e.target.value }))}
                          className="mt-2 text-sm"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Enter time in selected timezone
                        </div>
                      </div>
                    </div>
                    
                    {/* Timezone Preview */}
                    <div className="bg-muted/50 border rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Schedule Preview</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Your Input:</span>
                          <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                            {bulkCampaignFormData.scheduleDate} {bulkCampaignFormData.scheduleTime} 
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Timezone:</span>
                          <span className="font-mono bg-purple-100 px-2 py-1 rounded text-purple-800">
                            {getTimezoneInfo(bulkCampaignFormData.timezone).label.split(',')[0]} ({getTimezoneInfo(bulkCampaignFormData.timezone).offset})
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Campaign executes at:</span>
                          <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-800">
                            {bulkCampaignFormData.scheduleDate} {bulkCampaignFormData.scheduleTime} 
                          </span>
                        </div>
                        
                        {/* Validation Status */}
                        {bulkCampaignFormData.scheduleDate && bulkCampaignFormData.scheduleTime && (() => {
                          const scheduledDateTime = new Date(`${bulkCampaignFormData.scheduleDate}T${bulkCampaignFormData.scheduleTime}:00`);
                          const now = new Date();
                          const isValid = scheduledDateTime > now;
                          
                          return (
                            <div className="border-t pt-2 mt-2">
                              <div className="text-center">
                                {isValid ? (
                                  <span className="text-xs font-medium text-green-700">
                                    ✅ Valid - Campaign will execute at your local time
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-red-600">
                                    ❌ Invalid - This time has already passed. Please select a future time.
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                  </div>
                )}



                {/* Execute Button */}
                <Button 
                  onClick={executeBulkCampaign}
                  disabled={
                    sending || 
                    getAllSelectedPhones().length === 0 || 
                    !selectedSession || 
                    !bulkCampaignFormData.campaignId ||
                    !bulkCampaignFormData.name.trim()
                  }
                  className="w-full mt-4"
                  size="lg"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      <span className="text-sm sm:text-base">Executing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-sm sm:text-base">
                        {bulkCampaignFormData.scheduleType === 'now' ? 'Execute Now' : 'Schedule Campaign'}
                      </span>
                    </>
                  )}
                </Button>
                
                {/* Requirements Checklist */}
                <div>
                  <div className="space-y-1.5">
                    {/* WhatsApp Session Check */}
                    <div className="flex items-start space-x-2 text-xs">
                      {selectedSession ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-green-700">
                            <strong>WhatsApp Session:</strong> Connected ({selectedSession.sessionName})
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-red-700">
                            <strong>WhatsApp Session:</strong> Not selected. Please select a connected session.
                          </span>
                        </>
                      )}
                    </div>

                    {/* Campaign Selection Check */}
                    <div className="flex items-start space-x-2 text-xs">
                      {bulkCampaignFormData.campaignId ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-green-700">
                            <strong>Campaign:</strong> Selected ({campaigns.find(c => c.id === bulkCampaignFormData.campaignId)?.name})
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-red-700">
                            <strong>Campaign:</strong> Not selected. Please select a campaign template.
                          </span>
                        </>
                      )}
                    </div>

                    {/* Execution Name Check */}
                    <div className="flex items-start space-x-2 text-xs">
                      {bulkCampaignFormData.name.trim() ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-green-700">
                            <strong>Execution Name:</strong> Provided ({bulkCampaignFormData.name.trim().substring(0, 30)}{bulkCampaignFormData.name.trim().length > 30 ? '...' : ''})
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-red-700">
                            <strong>Execution Name:</strong> Required. Please enter a descriptive name.
                          </span>
                        </>
                      )}
                    </div>

                    {/* Contacts Selection Check */}
                    <div className="flex items-start space-x-2 text-xs">
                      {getAllSelectedPhones().length > 0 ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-green-700">
                            <strong>Contacts:</strong> {getAllSelectedPhones().length} contact(s) selected
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-red-700">
                            <strong>Contacts:</strong> No contacts selected. Please select at least one contact.
                          </span>
                        </>
                      )}
                    </div>

                    {/* Schedule Validation (only if scheduling for later) */}
                    {bulkCampaignFormData.scheduleType === 'later' && (
                      <div className="flex items-start space-x-2 text-xs">
                        {(() => {
                          if (!bulkCampaignFormData.scheduleDate || !bulkCampaignFormData.scheduleTime) {
                            return (
                              <>
                                <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-red-700">
                                  <strong>Schedule Time:</strong> Date or time not set. Please select both.
                                </span>
                              </>
                            );
                          }
                          
                          const scheduledDateTime = new Date(`${bulkCampaignFormData.scheduleDate}T${bulkCampaignFormData.scheduleTime}:00`);
                          const now = new Date();
                          const isValid = scheduledDateTime > now;
                          
                          if (isValid) {
                            return (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-green-700">
                                  <strong>Schedule Time:</strong> Valid future time
                                </span>
                              </>
                            );
                          } else {
                            return (
                              <>
                                <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-red-700">
                                  <strong>Schedule Time:</strong> Time has passed. Please select a future time.
                                </span>
                              </>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {/* <div className="pt-2 mt-2">
                    {sending ? (
                      <div className="text-xs text-center text-muted-foreground">
                        Please wait...
                      </div>
                    ) : (
                      <>
                        {selectedSession && 
                         bulkCampaignFormData.campaignId && 
                         bulkCampaignFormData.name.trim() && 
                         getAllSelectedPhones().length > 0 ? (
                          <div className="text-xs text-center text-green-700 font-medium">
                            
                          </div>
                        ) : (
                          <div className="text-xs text-center text-orange-700 font-medium button-t">
                            ⚠️ Please complete all requirements above
                          </div>
                        )}
                      </>
                    )}
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: WhatsApp Preview - Takes 2 columns on XL+ */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex justify-center">
              {/* Phone Frame */}
              <div className="relative w-64 h-[500px] sm:w-72 sm:h-[580px] bg-black rounded-[2rem] sm:rounded-[2.5rem] p-1.5 sm:p-2 shadow-2xl">
                {/* Phone Screen */}
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="bg-[#075E54] text-white px-5 py-1 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <span>9:41</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 12">
                        <rect x="1" y="4" width="22" height="4" rx="2"/>
                        <rect x="23" y="5" width="1" height="2"/>
                      </svg>
                    </div>
                  </div>

                  {/* WhatsApp Header */}
                  <div className="bg-[#075E54] text-white px-2 pb-3 flex items-center space-x-1 shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center overflow-hidden">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-xs">
                        {getAllSelectedPhones().length > 0 
                          ? getAllSelectedPhones().length === 1 
                            ? 'User'
                            : `Broadcast List (${getAllSelectedPhones().length})`
                          : 'Select Contact'
                        }
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Chat Background */}
                  <div 
                    className="flex-1 relative"
                    style={{
                      height: 'calc(100% - 120px)', // Adjust for header and input
                      backgroundColor: '#ECE5DD',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                  >
                    {/* Chat Messages */}
                    <div className="px-4 py-2 space-y-2 h-full overflow-y-auto">
                      {/* Show preview only if there's a selected campaign */}
                      {bulkCampaignFormData.campaignId && (() => {
                        const selectedCampaign = campaigns.find(c => c.id === bulkCampaignFormData.campaignId);
                        if (!selectedCampaign) return null;
                        
                        return (
                          <div className="flex justify-end animate-in slide-in-from-right-2 duration-300">
                            <div className="max-w-[280px]">
                              {/* Message Bubble */}
                              <div className="bg-[#DCF8C6] rounded-lg px-3 py-2 relative shadow-sm">
                                {/* Image Message */}
                                {selectedCampaign.type === 'image' && (
                                  <div className="mb-2">
                                    {selectedCampaign.image_url ? (
                                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                                        <div className="w-full h-full flex items-center justify-center">
                                          <div className="text-center">
                                            <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-1" />
                                            <span className="text-xs text-gray-500 font-medium">Image Preview</span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                          <span className="text-xs text-gray-500">Image preview</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Image Caption */}
                                    {selectedCampaign.caption && (
                                      <div className="text-sm mt-2 text-gray-800 leading-relaxed">
                                        {selectedCampaign.caption}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Text Message */}
                                {selectedCampaign.type === 'text' && selectedCampaign.message_body && (
                                  <div className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                                    {selectedCampaign.message_body}
                                  </div>
                                )}

                                {/* Message Time & Status */}
                                <div className="flex items-center justify-end mt-2 space-x-1">
                                  <span className="text-xs text-gray-500">
                                    {bulkCampaignFormData.scheduleType === 'later' 
                                      ? new Date(`${bulkCampaignFormData.scheduleDate}T${bulkCampaignFormData.scheduleTime}`).toLocaleTimeString('en-US', { 
                                          hour: 'numeric', 
                                          minute: '2-digit',
                                          hour12: false 
                                        })
                                      : new Date().toLocaleTimeString('en-US', { 
                                          hour: 'numeric', 
                                          minute: '2-digit',
                                          hour12: false 
                                        })
                                    }
                                  </span>
                                  {/* WhatsApp double check marks */}
                                  <svg className="w-4 h-4 text-[#4FC3F7]" viewBox="0 0 16 15" fill="none">
                                    <path d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L3.724 9.587a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z" fill="currentColor"/>
                                  </svg>
                                </div>
                              </div>

                              {/* Message tail */}
                              <div className="relative">
                                <div className="absolute right-0 -top-2 w-0 h-0" 
                                      style={{
                                        borderLeft: '8px solid #DCF8C6',
                                        borderTop: '8px solid transparent',
                                        borderBottom: '0px solid transparent'
                                      }}>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Empty State */}
                      {!bulkCampaignFormData.campaignId && (
                        <div className="text-center text-gray-500 mt-32">
                          <div className="bg-white/50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <p className="text-xs font-medium">Campaign preview</p>
                          <p className="text-xs mt-1 opacity-75">Select a campaign to preview...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Input Area */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#F0F0F0] px-2 py-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      
                      <div className="flex-1 bg-white rounded-full px-2 py-1 border border-gray-300 flex items-center space-x-2">
                        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </button>
                        <span className="text-xs text-gray-400 flex-1">type a message</span>
                        <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                        </button>
                      </div>
                      <button className="w-8 h-8 bg-[#075E54] rounded-full flex items-center justify-center hover:bg-[#128C7E] transition-colors shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl"></div>
                
                {/* Home Indicator */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
        )}


        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Campaign Templates</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                <Button 
                  onClick={fetchCampaigns}
                  disabled={campaignsLoading}
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {campaignsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="ml-2 sm:hidden">Refresh Templates</span>
                </Button>
                
                {/* Create Campaign Dialog */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => { setEditingCampaign(null); resetCampaignForm(); setCreateDialogOpen(true); }} className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
                      <DialogDescription className="text-sm">
                        Create a new campaign template that can be used for bulk messaging.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 sm:space-y-5">
                      {/* Campaign Name */}
                      <div>
                        <Label htmlFor="campaignName" className="text-sm font-medium">Campaign Name</Label>
                        <Input
                          id="campaignName"
                          placeholder="Enter campaign name..."
                          value={campaignFormData.name}
                          onChange={(e) => setCampaignFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-2 text-sm"
                        />
                      </div>

                      {/* Campaign Type */}
                      <div>
                        <Label className="text-sm font-medium">Message Type</Label>
                        <Select 
                          value={campaignFormData.type} 
                          onValueChange={(value: any) => 
                            setCampaignFormData(prev => ({ ...prev, type: value }))
                          }
                          disabled={!!editingCampaign}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="w-4 h-4" />
                                <span>Text Message</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="image">
                              <div className="flex items-center space-x-2">
                                <ImageIcon className="w-4 h-4" />
                                <span>Image Message</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="audio" disabled>
                              <div className="flex items-center space-x-2 opacity-50">
                                <Mic className="w-4 h-4" />
                                <span>Audio Message (Coming Soon)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="document" disabled>
                              <div className="flex items-center space-x-2 opacity-50">
                                <FileText className="w-4 h-4" />
                                <span>Document Message (Coming Soon)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="video" disabled>
                              <div className="flex items-center space-x-2 opacity-50">
                                <Video className="w-4 h-4" />
                                <span>Video Message (Coming Soon)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="location" disabled>
                              <div className="flex items-center space-x-2 opacity-50">
                                <MapPin className="w-4 h-4" />
                                <span>Location Message (Coming Soon)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="contact" disabled>
                              <div className="flex items-center space-x-2 opacity-50">
                                <Contact className="w-4 h-4" />
                                <span>Contact Message (Coming Soon)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="template" disabled>
                              <div className="flex items-center space-x-2 opacity-50">
                                <Layout className="w-4 h-4" />
                                <span>Template Message (Coming Soon)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            <strong>Currently Available:</strong> Text and Image messages only.
                            <br />
                            Other message types will be available soon. Use the <strong>Testing</strong> page to try all message types.
                          </AlertDescription>
                        </Alert>
                      </div>

                      {/* Text Message */}
                      {campaignFormData.type === 'text' && (
                        <div>
                          <Label htmlFor="messageBody" className="text-sm font-medium">Message Content</Label>
                          <Textarea
                            id="messageBody"
                            placeholder="Enter your message content..."
                            value={campaignFormData.messageBody}
                            onChange={(e) => setCampaignFormData(prev => ({ ...prev, messageBody: e.target.value }))}
                            rows={4}
                            className="mt-2 text-sm"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {campaignFormData.messageBody.length} characters
                          </div>
                        </div>
                      )}

                      {/* Image Message */}
                      {campaignFormData.type === 'image' && (
                        <div className="space-y-4">
                          {/* Image URL */}
                          <div>
                            <Label htmlFor="imageUrl" className="text-sm font-medium">Image URL</Label>
                            <Input
                              id="imageUrl"
                              placeholder="https://example.com/image.jpg"
                              value={campaignFormData.imageUrl}
                              onChange={(e) => setCampaignFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                              className="mt-2 text-sm"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              Supported formats: PNG, JPG, JPEG only
                            </div>
                            {campaignFormData.imageUrl && !(/\.(png|jpg|jpeg)$/i.test(campaignFormData.imageUrl)) && (
                              <div className="text-xs text-red-500 mt-1">
                                Please use a valid image URL ending with .png, .jpg, or .jpeg
                              </div>
                            )}
                          </div>

                          {/* Image Caption */}
                          <div>
                            <Label htmlFor="imageCaption" className="text-sm font-medium">Image Caption</Label>
                            <Input
                              id="imageCaption"
                              placeholder="Image caption (optional)"
                              value={campaignFormData.imageCaption}
                              onChange={(e) => setCampaignFormData(prev => ({ ...prev, imageCaption: e.target.value }))}
                              className="mt-2 text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Campaign Status */}
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Select 
                          value={campaignFormData.status} 
                          onValueChange={(value: 'active' | 'inactive') => 
                            setCampaignFormData(prev => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCreateDialogOpen(false);
                          setEditingCampaign(null);
                          resetCampaignForm();
                        }}
                        className="w-full sm:w-auto order-2 sm:order-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={editingCampaign ? updateCampaign : createCampaign}
                        disabled={loading}
                        className="w-full sm:w-auto order-1 sm:order-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span className="text-sm">{editingCampaign ? 'Updating...' : 'Creating...'}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm">{editingCampaign ? 'Update Campaign' : 'Create Campaign'}</span>
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                <span className="ml-2 text-sm">Loading campaigns...</span>
              </div>
            ) : campaigns.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center">
                <div className="text-muted-foreground">
                  <Database className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-base sm:text-lg font-medium mb-2">No campaigns found</p>
                  <p className="text-sm">Create your first campaign template to get started</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-3">
                  {getPaginatedCampaigns().map((campaign) => (
                    <Card key={campaign.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm truncate">{campaign.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {campaign.type === 'text' ? (
                                  <>
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Text
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="w-3 h-3 mr-1" />
                                    Image
                                  </>
                                )}
                              </Badge>
                              <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                {campaign.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {campaign.type === 'text' && campaign.message_body && (
                            <p className="whitespace-pre-wrap break-words">
                              {campaign.message_body.length > 80 
                                ? campaign.message_body.substring(0, 80) + '...'
                                : campaign.message_body
                              }
                            </p>
                          )}
                          {campaign.type === 'image' && (
                            <div className="space-y-1">
                              <p>📷 Image message</p>
                              {campaign.caption && (
                                <p className="whitespace-pre-wrap break-words">
                                  {campaign.caption.length > 60 
                                    ? campaign.caption.substring(0, 60) + '...'
                                    : campaign.caption
                                  }
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editCampaign(campaign)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCampaign(campaign.id)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Campaign Name</TableHead>
                          <TableHead className="w-[100px]">Type</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="max-w-[300px]">Content Preview</TableHead>
                          <TableHead className="w-[120px]">Created</TableHead>
                          <TableHead className="w-[120px] text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {getPaginatedCampaigns().map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div className="font-medium">{campaign.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                              {campaign.type === 'text' ? (
                                <>
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Text</span>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="w-3 h-3" />
                                  <span>Image</span>
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                            <TableCell className="max-w-md">
                            {campaign.type === 'text' && campaign.message_body && (
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                              {campaign.message_body.length > 60 
                                ? campaign.message_body.substring(0, 60) + '...'
                                : campaign.message_body
                              }
                              </p>
                            )}
                            {campaign.type === 'image' && (
                                <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm">📷 Image message</p>
                                  {campaign.image_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => window.open(campaign.image_url, '_blank')}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View
                                  </Button>
                                  )}
                                </div>
                                <p 
                                  className="text-xs text-muted-foreground break-all max-w-[200px] cursor-pointer hover:text-primary transition-colors"
                                  onClick={() => campaign.image_url && copyToClipboard(campaign.image_url)}
                                  title="Click to copy URL"
                                >
                                  {campaign.image_url
                                  ? campaign.image_url
                                  : 'No image URL'
                                  }
                                </p>
                                {campaign.caption && (
                                  <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                                  {campaign.caption.length > 40 
                                    ? campaign.caption.substring(0, 40) + '...'
                                    : campaign.caption
                                  }
                                  </p>
                                )}
                                </div>
                            )}
                            </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => editCampaign(campaign)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteCampaign(campaign.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Campaign Templates Pagination */}
                {campaigns.length > campaignPageSize && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-4">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Showing {((campaignPage - 1) * campaignPageSize) + 1} to {Math.min(campaignPage * campaignPageSize, campaigns.length)} of {campaigns.length} campaigns
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCampaignPage(prev => Math.max(prev - 1, 1))}
                        disabled={campaignPage === 1}
                        className="px-2 sm:px-3"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(getTotalCampaignPages(), 5) }, (_, i) => {
                          let page;
                          if (getTotalCampaignPages() <= 5) {
                            page = i + 1;
                          } else if (campaignPage <= 3) {
                            page = i + 1;
                          } else if (campaignPage >= getTotalCampaignPages() - 2) {
                            page = getTotalCampaignPages() - 4 + i;
                          } else {
                            page = campaignPage - 2 + i;
                          }
                          return (
                            <Button
                              key={page}
                              variant={page === campaignPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCampaignPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCampaignPage(prev => Math.min(prev + 1, getTotalCampaignPages()))}
                        disabled={campaignPage === getTotalCampaignPages()}
                        className="px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Broadcast History</span>
              </div>
              <Button 
                onClick={fetchBulkHistory}
                disabled={historyLoading}
                size="sm"
                variant="outline"
                className="w-full sm:w-auto"
              >
                {historyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    <span className="text-sm">Refresh</span>
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {historyLoading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                <span className="ml-2 text-sm">Loading history...</span>
              </div>
            ) : bulkHistory.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center">
                <div className="text-muted-foreground">
                  <History className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <h4 className="text-base sm:text-lg font-medium mb-2">No campaign executions yet</h4>
                  <p className="text-sm mb-4 sm:mb-6">
                    Your bulk campaign executions will appear here once you start sending campaigns.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Mobile Card View */}
                <div className="block lg:hidden space-y-3">
                  {getPaginatedHistory().map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm truncate">{item.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.type === 'text' ? (
                                  <>
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Text
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="w-3 h-3 mr-1" />
                                    Image
                                  </>
                                )}
                              </Badge>
                              <Badge variant={
                                item.status === 'completed' ? 'default' :
                                item.status === 'pending' ? 'secondary' :
                                item.status === 'scheduled' ? 'outline' :
                                item.status === 'processing' ? 'secondary' :
                                'destructive'
                              } className="text-xs">
                                {item.status}
                              </Badge>
                            </div>
                            {item.scheduled_at && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                                <Clock className="w-3 h-3" />
                                <span>Scheduled: {new Date(item.scheduled_at).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-xs text-muted-foreground">Total</div>
                            <div className="text-sm font-medium">{item.total_count}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Sent</div>
                            <div className={`text-sm font-medium ${item.sent_count > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                              {item.sent_count}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Failed</div>
                            <div className={`text-sm font-medium ${item.failed_count > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                              {item.failed_count}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex items-center space-x-2">
                            {/* Show Delete button only for scheduled or pending status */}
                            {(item.status === 'scheduled' || item.status === 'pending') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteBulkCampaign(item.id)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-700 hover:border-red-600"
                              >
                                {loading ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    <span className="text-xs">Delete</span>
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchCampaignDetails(item.id)}
                              disabled={detailsLoading}
                            >
                              {detailsLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Eye className="w-3 h-3 mr-1" />
                                  <span className="text-xs">Details</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Campaign Name</TableHead>
                          <TableHead className="w-[100px]">Type</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="w-[80px] text-center">Total</TableHead>
                          <TableHead className="w-[80px] text-center">Sent</TableHead>
                          <TableHead className="w-[80px] text-center">Failed</TableHead>
                          <TableHead className="w-[120px]">Created</TableHead>
                          <TableHead className="w-[100px] text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {getPaginatedHistory().map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{item.name}</div>
                              {item.scheduled_at && (
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>Scheduled: {new Date(item.scheduled_at).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                              {item.type === 'text' ? (
                                <>
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Text</span>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="w-3 h-3" />
                                  <span>Image</span>
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              item.status === 'completed' ? 'default' :
                              item.status === 'pending' ? 'secondary' :
                              item.status === 'scheduled' ? 'outline' :
                              item.status === 'processing' ? 'secondary' :
                              'destructive'
                            }>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {item.total_count}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={item.sent_count > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                              {item.sent_count}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={item.failed_count > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                              {item.failed_count}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {/* Show Delete button only for scheduled or pending status */}
                              {(item.status === 'scheduled' || item.status === 'pending') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteBulkCampaign(item.id)}
                                  disabled={loading}
                                  className="text-red-600 hover:text-red-700 hover:border-red-600"
                                >
                                  {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchCampaignDetails(item.id)}
                                disabled={detailsLoading}
                              >
                                {detailsLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-1" />
                                    Details
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Campaign History Pagination */}
                {bulkHistory.length > historyPageSize && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-4">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Showing {((historyPage - 1) * historyPageSize) + 1} to {Math.min(historyPage * historyPageSize, bulkHistory.length)} of {bulkHistory.length} executions
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                        disabled={historyPage === 1}
                        className="px-2 sm:px-3"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Previous</span>
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(getTotalHistoryPages(), 5) }, (_, i) => {
                          let page;
                          if (getTotalHistoryPages() <= 5) {
                            page = i + 1;
                          } else if (historyPage <= 3) {
                            page = i + 1;
                          } else if (historyPage >= getTotalHistoryPages() - 2) {
                            page = getTotalHistoryPages() - 4 + i;
                          } else {
                            page = historyPage - 2 + i;
                          }
                          return (
                            <Button
                              key={page}
                              variant={page === historyPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setHistoryPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryPage(prev => Math.min(prev + 1, getTotalHistoryPages()))}
                        disabled={historyPage === getTotalHistoryPages()}
                        className="px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Campaign Details</DialogTitle>
            <DialogDescription className="text-sm">
              Detailed information about the bulk campaign execution and individual message status.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaignDetails && (
            <div className="space-y-6">
              {/* Campaign Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Campaign Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Campaign Name</Label>
                      <p className="font-medium">{selectedCampaignDetails.bulk_campaign.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Template</Label>
                      <p>{selectedCampaignDetails.bulk_campaign.campaign?.name || 'N/A'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        {selectedCampaignDetails.bulk_campaign.type === 'text' ? (
                          <>
                            <MessageSquare className="w-3 h-3" />
                            <span>Text</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-3 h-3" />
                            <span>Image</span>
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge variant={
                        selectedCampaignDetails.bulk_campaign.status === 'completed' ? 'default' :
                        selectedCampaignDetails.bulk_campaign.status === 'pending' ? 'secondary' :
                        selectedCampaignDetails.bulk_campaign.status === 'scheduled' ? 'outline' :
                        selectedCampaignDetails.bulk_campaign.status === 'processing' ? 'secondary' :
                        'destructive'
                      }>
                        {selectedCampaignDetails.bulk_campaign.status}
                      </Badge>
                    </div>
                    {selectedCampaignDetails.bulk_campaign.message_body && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Message Content</Label>
                        <p className="text-sm bg-muted p-3 rounded-lg mt-1">
                          {selectedCampaignDetails.bulk_campaign.message_body}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Execution Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{selectedCampaignDetails.bulk_campaign.total_count}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedCampaignDetails.bulk_campaign.sent_count}</div>
                        <div className="text-sm text-green-600">Sent</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{selectedCampaignDetails.bulk_campaign.failed_count}</div>
                        <div className="text-sm text-red-600">Failed</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(selectedCampaignDetails.bulk_campaign.created_at).toLocaleString()}</span>
                      </div>
                      {selectedCampaignDetails.bulk_campaign.processed_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Processed:</span>
                          <span>{new Date(selectedCampaignDetails.bulk_campaign.processed_at).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedCampaignDetails.bulk_campaign.completed_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completed:</span>
                          <span>{new Date(selectedCampaignDetails.bulk_campaign.completed_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Message Details Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Message Status Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Message ID</TableHead>
                          <TableHead>Sent At</TableHead>
                          <TableHead>Error Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCampaignDetails.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono">{item.phone}</TableCell>
                            <TableCell>
                              <Badge variant={
                                item.status === 'sent' ? 'default' :
                                item.status === 'failed' ? 'destructive' :
                                'secondary'
                              }>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {item.message_id || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.sent_at ? new Date(item.sent_at).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell className="text-sm text-red-600">
                              {item.error_message || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </SubscriptionGuard>
  );
}
