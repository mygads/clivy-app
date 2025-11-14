'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Activity,
  Search,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Plus,
  XCircle,
  QrCode,
  CheckCircle,
  Zap,
  Settings,
  Phone,
  Smartphone,
  ShieldCheck,
  Trash2,
  Lock,
  Copy,
  AlertTriangle,
  Send,
  Save,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SessionManager } from '@/lib/storage';
import SubscriptionGuard from '@/components/whatsapp/subscription-guard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Available webhook events
const WEBHOOK_EVENTS = [
  "Receipt",
  "GroupInfo",
  "JoinedGroup",
  "Picture",
  "BlocklistChange",
  "Blocklist",
  "Connected",
  "Disconnected",
  "ConnectFailure",
  "KeepAliveRestored",
  "KeepAliveTimeout",
  "LoggedOut",
  "ClientOutdated",
  "TemporaryBan",
  "StreamError",
  "StreamReplaced",
  "PairSuccess",
  "PairError",
  "QR",
  "QRScannedWithoutMultidevice",
  "PrivacySettings",
  "PushNameSetting",
  "UserAbout",
  "AppState",
  "AppStateSyncComplete",
  "HistorySync",
  "OfflineSyncCompleted",
  "OfflineSyncPreview",
  "IdentityChange",
  "CATRefreshError",
  "NewsletterJoin",
  "NewsletterLeave",
  "NewsletterMuteChange",
  "NewsletterLiveUpdate",
  "FBMessage"
];

// Types based on customer API response
interface WhatsAppSession {
  id: string;
  sessionId: string;
  sessionName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  qrcode: string | null;
  message: string | null;
  webhook?: string;
  // Computed properties for compatibility with existing components
  name?: string;
  connected?: boolean;
  loggedIn?: boolean;
  jid?: string | null;
  token?: string;
  events?: string;
  // Additional database fields
  userId?: string;
  isSystemSession?: boolean;
  proxyEnabled?: boolean;
  autoReadMessages?: boolean;
  typingIndicator?: boolean;
  hasActiveBot?: boolean;
  aiBotInfo?: {
    botId: string;
    botName: string;
    botActive: boolean;
  } | null;
  proxyUrl?: string;
  s3Enabled?: boolean;
  s3Endpoint?: string;
  s3Region?: string;
  s3Bucket?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3PathStyle?: boolean;
  s3PublicUrl?: string;
  s3MediaDelivery?: string;
  s3RetentionDays?: number;
}

interface SessionStats {
  totalSessions: number;
  connectedSessions: number;
  disconnectedSessions: number;
  qrRequiredSessions: number;
  maxSessions: number;
  currentSessions: number;
  packageName: string;
}

interface CreateSessionForm {
  name: string;
  token: string;
  webhook: string;
  events: string;
  proxyConfig: {
    enabled: boolean;
    proxyURL: string;
  };
  s3Config: {
    enabled: boolean;
    endpoint: string;
    region: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    pathStyle: boolean;
    publicURL: string;
    mediaDelivery: string;
    retentionDays: number;
  };
}

export default function WhatsAppDevicesPage() {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    connectedSessions: 0,
    disconnectedSessions: 0,
    qrRequiredSessions: 0,
    maxSessions: 0,
    currentSessions: 0,
    packageName: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showPairPhoneDialog, setShowPairPhoneDialog] = useState(false);
  const [showAdvancedEditDialog, setShowAdvancedEditDialog] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<WhatsAppSession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<WhatsAppSession | null>(null);
  const [sessionToControl, setSessionToControl] = useState<WhatsAppSession | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateSessionForm>({
    name: '',
    token: '',
    webhook: '',
    events: 'Message', // Default to Message instead of All
    proxyConfig: {
      enabled: false,
      proxyURL: ''
    },
    s3Config: {
      enabled: false,
      endpoint: '',
      region: '',
      bucket: '',
      accessKey: '',
      secretKey: '',
      pathStyle: false,
      publicURL: '',
      mediaDelivery: 'base64',
      retentionDays: 30
    }
  });

  // Advanced edit form state (webhook, proxy, s3)
  const [editFormData, setEditFormData] = useState({
    webhook: {
      url: '',
      events: [] as string[],
      allEvents: true
    },
    proxy: {
      enabled: false,
      url: ''
    },
    s3: {
      enabled: false,
      endpoint: '',
      region: '',
      bucket: '',
      accessKeyId: '',
      secretAccessKey: '',
      pathStyle: false,
      publicUrl: '',
      mediaDelivery: 'base64',
      retentionDays: 30
    }
  });

  // Original form values for change detection
  const [originalEditFormData, setOriginalEditFormData] = useState(editFormData);

  // Available webhook events from external service
  const [availableWebhookEvents, setAvailableWebhookEvents] = useState<string[]>([]);
  const [allSupportedEvents, setAllSupportedEvents] = useState<string[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Advanced edit states
  const [sessionToEdit, setSessionToEdit] = useState<WhatsAppSession | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Events selection state
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["Message"]); // Default to Message
  const [isAllEvents, setIsAllEvents] = useState(false); // Default to false since we start with Message only

  // Session control states
  const [connectForm, setConnectForm] = useState({
    Subscribe: [] as string[],
    Immediate: true
  });
  const [pairPhoneForm, setPairPhoneForm] = useState({
    Phone: ''
  });
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [linkingCode, setLinkingCode] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGettingStatus, setIsGettingStatus] = useState(false);
  const [isGettingQR, setIsGettingQR] = useState(false);
  const [isPairingPhone, setIsPairingPhone] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [statusPolling, setStatusPolling] = useState<NodeJS.Timeout | null>(null);
  const [qrPolling, setQrPolling] = useState<NodeJS.Timeout | null>(null);
  const [isPhonePairingMode, setIsPhonePairingMode] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(true); // Track subscription status - default true
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false); // Track if current sessions exceed max quota
  const [sessionsToDelete, setSessionsToDelete] = useState(0); // Number of sessions need to be deleted
  const [isSavingAdvanced, setIsSavingAdvanced] = useState(false);
  
  // Toggle states for session settings
  const [togglingAutoRead, setTogglingAutoRead] = useState<{[key: string]: boolean}>({});
  const [togglingTyping, setTogglingTyping] = useState<{[key: string]: boolean}>({});
  const [isDeletingProxy, setIsDeletingProxy] = useState(false);
  const [isDeletingWebhook, setIsDeletingWebhook] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Webhook editing state
  const [webhookEdits, setWebhookEdits] = useState<{[key: string]: string}>({});
  const [savingWebhook, setSavingWebhook] = useState<{[key: string]: boolean}>({});

  const router = useRouter();
  const { toast } = useToast();

  // Helper functions for events management
  const handleEventToggle = (event: string, checked: boolean) => {
    // "Message" event is mandatory and cannot be unchecked
    if (event === "Message" && !checked) {
      return; // Prevent unchecking "Message" event
    }

    if (checked) {
      const newSelected = [...selectedEvents, event];
      setSelectedEvents(newSelected);

      // Check if all events are selected
      const totalEvents = availableWebhookEvents.length > 0 ? availableWebhookEvents.length : WEBHOOK_EVENTS.length;
      if (newSelected.length === totalEvents) {
        setIsAllEvents(true);
        setCreateForm(prev => ({ ...prev, events: 'All' }));
      } else {
        setIsAllEvents(false);
        setCreateForm(prev => ({ ...prev, events: newSelected.join(',') }));
      }
    } else {
      const newSelected = selectedEvents.filter(e => e !== event);
      setSelectedEvents(newSelected);
      setIsAllEvents(false);

      // Ensure "Message" is always included
      const finalSelected = newSelected.includes("Message") ? newSelected : [...newSelected, "Message"];
      
      if (finalSelected.length === 0) {
        // If no events selected, default to "Message" instead of "All"
        setCreateForm(prev => ({ ...prev, events: 'Message' }));
        setSelectedEvents(["Message"]);
      } else {
        setCreateForm(prev => ({ ...prev, events: finalSelected.join(',') }));
        setSelectedEvents(finalSelected);
      }
    }
  };

  const handleAllEventsToggle = (checked: boolean) => {
    if (checked) {
      setIsAllEvents(true);
      setSelectedEvents([]);
      setCreateForm(prev => ({ ...prev, events: 'All' }));
    } else {
      setIsAllEvents(false);
      // When unchecking "All Events", default to "Message" only
      setSelectedEvents(["Message"]);
      setCreateForm(prev => ({ ...prev, events: 'Message' }));
    }
  };

  // Reset form when dialog closes
  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setCreateForm({
      name: '',
      token: '',
      webhook: '',
      events: 'Message', // Reset to Message default
      proxyConfig: {
        enabled: false,
        proxyURL: ''
      },
      s3Config: {
        enabled: false,
        endpoint: '',
        region: '',
        bucket: '',
        accessKey: '',
        secretKey: '',
        pathStyle: false,
        publicURL: '',
        mediaDelivery: 'base64',
        retentionDays: 30
      }
    });
    setSelectedEvents(["Message"]); // Reset to Message only
    setIsAllEvents(false); // Reset to false
    // Clear webhook events
    setAvailableWebhookEvents([]);
    setIsLoadingEvents(false);
  };

  // Fetch sessions data - Customer API endpoint
  const fetchSessions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const token = SessionManager.getToken();

      // Use customer API endpoint instead of admin
      const response = await fetch('/api/customer/whatsapp/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          // Handle subscription required error
          const errorData = await response.json();
          setHasSubscription(false);
          setStats({
            totalSessions: 0,
            connectedSessions: 0,
            disconnectedSessions: 0,
            qrRequiredSessions: 0,
            maxSessions: 0,
            currentSessions: 0,
            packageName: ''
          });
          setSessions([]);
          toast({
            title: 'Subscription Required',
            description: errorData.message || 'Active WhatsApp subscription required',
            variant: 'destructive',
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setHasSubscription(true);

        // Map customer API data to component format - use actual database fields
        const mappedSessions = (data.data || []).map((session: any) => ({
          ...session,
          // Add compatibility properties - use actual database values
          name: session.sessionName,
          connected: session.connected || false, // Use actual connected field from DB
          loggedIn: session.loggedIn || false, // Use actual loggedIn field from DB
          jid: session.jid || null,
          token: session.token // Use actual token field from DB
        }));

        setSessions(mappedSessions);

        // Calculate stats from the mapped sessions
        const totalSessions = mappedSessions.length;
        const connectedSessions = mappedSessions.filter((s: WhatsAppSession) =>
          s.connected && s.loggedIn
        ).length;
        const disconnectedSessions = mappedSessions.filter((s: WhatsAppSession) =>
          !s.connected
        ).length;
        const qrRequiredSessions = mappedSessions.filter((s: WhatsAppSession) =>
          !s.loggedIn && !s.connected
        ).length;

        setStats({
          totalSessions,
          connectedSessions,
          disconnectedSessions,
          qrRequiredSessions,
          maxSessions: data.subscription?.maxSessions || 0,
          currentSessions: data.subscription?.currentSessions || totalSessions,
          packageName: data.subscription?.packageName || ''
        });

        // Check if quota is exceeded
        const maxSessions = data.subscription?.maxSessions || 0;
        const exceeded = maxSessions > 0 && totalSessions > maxSessions;
        setIsQuotaExceeded(exceeded);
        setSessionsToDelete(exceeded ? totalSessions - maxSessions : 0);

        if (exceeded) {
          toast({
            title: 'Session Quota Exceeded',
            description: `You have ${totalSessions} sessions but your plan allows only ${maxSessions}. Please delete ${totalSessions - maxSessions} session(s) to continue using WhatsApp services.`,
            variant: 'destructive',
          });
        }
      } else {
        throw new Error(data.error || 'Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch WhatsApp sessions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, setHasSubscription]);

  // Toggle Auto-Read Messages
  const handleToggleAutoRead = async (sessionId: string, currentValue: boolean) => {
    if (!hasSubscription) {
      toast({
        title: 'Subscription Required',
        description: 'Active WhatsApp subscription required to manage sessions',
        variant: 'destructive',
      });
      return;
    }

    const newValue = !currentValue;

    try {
      setTogglingAutoRead(prev => ({ ...prev, [sessionId]: true }));
      const token = SessionManager.getToken();

      const response = await fetch('/api/customer/whatsapp/session', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          autoReadMessages: newValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update auto-read setting');
      }

      toast({
        title: 'Success',
        description: `Auto-read messages ${newValue ? 'enabled' : 'disabled'}`,
      });

      // Update local state
      setSessions(prev => prev.map(s => 
        s.sessionId === sessionId 
          ? { ...s, autoReadMessages: newValue }
          : s
      ));
    } catch (error) {
      console.error('Error toggling auto-read:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update auto-read setting',
        variant: 'destructive',
      });
    } finally {
      setTogglingAutoRead(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  // Toggle Typing Indicator
  const handleToggleTyping = async (sessionId: string, currentValue: boolean) => {
    if (!hasSubscription) {
      toast({
        title: 'Subscription Required',
        description: 'Active WhatsApp subscription required to manage sessions',
        variant: 'destructive',
      });
      return;
    }

    const newValue = !currentValue;

    try {
      setTogglingTyping(prev => ({ ...prev, [sessionId]: true }));
      const token = SessionManager.getToken();

      const response = await fetch('/api/customer/whatsapp/session', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          typingIndicator: newValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update typing indicator setting');
      }

      toast({
        title: 'Success',
        description: `Typing indicator ${newValue ? 'enabled' : 'disabled'}`,
      });

      // Update local state
      setSessions(prev => prev.map(s => 
        s.sessionId === sessionId 
          ? { ...s, typingIndicator: newValue }
          : s
      ));
    } catch (error) {
      console.error('Error toggling typing indicator:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update typing indicator setting',
        variant: 'destructive',
      });
    } finally {
      setTogglingTyping(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  // Create new session
  const handleCreateSession = async () => {
    // Check subscription status first
    if (!hasSubscription) {
      toast({
        title: 'Subscription Required',
        description: 'Active WhatsApp subscription required to create new sessions',
        variant: 'destructive',
      });
      return;
    }

    // Check if quota is exceeded
    if (isQuotaExceeded) {
      toast({
        title: 'Session Quota Exceeded',
        description: `Please delete ${sessionsToDelete} session(s) first before creating new sessions. Your current plan allows only ${stats.maxSessions} sessions.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (!createForm.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Session name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!createForm.token.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Session token is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);
      const token = SessionManager.getToken();

      // Prepare events data - ensure "Message" is always included and never empty
      let eventsToSend: string;
      if (isAllEvents) {
        eventsToSend = 'All';
      } else {
        // Make sure "Message" is included
        const finalEvents = selectedEvents.includes('Message') ? selectedEvents : [...selectedEvents, 'Message'];
        // If no events selected or empty, default to "Message"
        eventsToSend = finalEvents.length > 0 ? finalEvents.join(',') : 'Message';
      }

      // Prepare request payload with proper events validation
      const formToSend = {
        ...createForm,
        events: eventsToSend // Ensure events are never empty and Message is always included
      };

      const response = await fetch('/api/customer/whatsapp/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'WhatsApp session created successfully',
        });
        setShowCreateDialog(false);
        // Reset form and events state
        setCreateForm({
          name: '',
          token: '',
          webhook: '',
          events: 'Message', // Reset to Message default
          proxyConfig: {
            enabled: false,
            proxyURL: ''
          },
          s3Config: {
            enabled: false,
            endpoint: '',
            region: '',
            bucket: '',
            accessKey: '',
            secretKey: '',
            pathStyle: false,
            publicURL: '',
            mediaDelivery: 'base64',
            retentionDays: 30
          }
        });
        setSelectedEvents(["Message"]); // Reset to Message only
        setIsAllEvents(false); // Reset to false
        fetchSessions();
      } else {
        throw new Error(data.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create WhatsApp session',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Delete session
  const handleDeleteClick = (session: WhatsAppSession) => {
    setSessionToDelete(session);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    try {
      setIsDeleting(true);
      const token = SessionManager.getToken();

      const response = await fetch(`/api/customer/whatsapp/sessions/${sessionToDelete.sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'WhatsApp session deleted successfully',
        });
        fetchSessions();
        setShowDeleteDialog(false);
        setSessionToDelete(null);
      } else {
        throw new Error(data.error || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete WhatsApp session',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // View session details
  const handleViewDetails = (session: WhatsAppSession) => {
    setSelectedSession(session);
    setShowDetailsDialog(true);
  };

  // Session Control Functions

  // Connect Session
  const handleConnectSession = (session: WhatsAppSession) => {
    setSessionToControl(session);

    // Customer sessions don't have custom webhook events
    // We'll use default events for all customer sessions
    const subscribeEvents: string[] = ['Message'];

    setConnectForm({
      Subscribe: subscribeEvents,
      Immediate: true
    });

    // Only show Connect dialog first
    setShowConnectDialog(true);
  };

  const handleConfirmConnect = async () => {
    if (!sessionToControl) return;

    setIsConnecting(true);
    try {
      const token = SessionManager.getToken();

      const response = await fetch(`/api/customer/whatsapp/sessions/${sessionToControl.sessionId}/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectForm),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Session connected successfully. QR code is now available for authentication.',
        });

        // Close Connect dialog
        setShowConnectDialog(false);

        // Refresh sessions list
        fetchSessions();

        // NOW show QR dialog and start polling after successful connection
        setQrCode('');
        setSessionStatus(null);
        setShowQrDialog(true);

        // Check initial status before starting polling
        const initialStatus = await fetchSessionStatus(sessionToControl.id);
        if (initialStatus?.loggedIn) {
          console.log('[CONNECT] Session already logged in, not starting polling');
          return;
        }

        // Start QR polling after connection success - only if not already logged in
        await fetchQRCode(sessionToControl.sessionId);

        // Status polling every 1 second
        const statusInterval = setInterval(async () => {
          console.log(`[CONNECT] Polling status for session: ${sessionToControl.id}`);
          const currentStatus = await fetchSessionStatus(sessionToControl.id);
          if (currentStatus?.loggedIn) {
            console.log('[CONNECT] Session logged in, clearing intervals');
            clearInterval(statusInterval);
            clearInterval(qrInterval);
            setStatusPolling(null);
            setQrPolling(null);
          }
        }, 1000);
        setStatusPolling(statusInterval);

        // QR code polling every 2 seconds
        const qrInterval = setInterval(async () => {
          await fetchQRCode(sessionToControl.sessionId);
        }, 2000);
        setQrPolling(qrInterval);

      } else {
        throw new Error(data.error || 'Failed to connect session');
      }
    } catch (error) {
      console.error('Error connecting session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect session',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Get Session Status
  const handleGetStatus = async (session: WhatsAppSession) => {
    setSessionToControl(session);
    setSessionStatus(null);
    setQrCode('');
    setShowStatusDialog(true);

    // Check initial status before starting polling
    const initialStatus = await fetchSessionStatus(session.sessionId);
    if (initialStatus?.loggedIn) {
      console.log('[STATUS] Session already logged in, not starting polling');
      return;
    }

    // Start polling for status updates every 3 seconds - only if not already logged in
    const interval = setInterval(async () => {
      console.log(`[STATUS] Polling status for session: ${session.sessionId}`);
      const currentStatus = await fetchSessionStatus(session.sessionId);
      if (currentStatus?.loggedIn) {
        console.log('[STATUS] Session logged in, clearing interval');
        clearInterval(interval);
        setStatusPolling(null);
      }
    }, 3000);
    setStatusPolling(interval);
  };

  const fetchSessionStatus = async (sessionId: string) => {
    console.log(`[fetchSessionStatus] Checking status for session: ${sessionId}`);
    try {
      setIsGettingStatus(true);
      const token = SessionManager.getToken();
      if (!token) return null;

      const response = await fetch(`/api/customer/whatsapp/sessions/${sessionId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`[fetchSessionStatus] Status received for ${sessionId}:`, {
            connected: data.data.connected,
            loggedIn: data.data.loggedIn,
            hasQR: !!data.data.qrcode
          });
          
          setSessionStatus(data.data);
          setQrCode(data.data.qrcode || '');

          // Stop both status and QR polling if logged in
          if (data.data.loggedIn) {
            console.log(`[fetchSessionStatus] Session ${sessionId} is logged in, stopping all polling`);
            if (statusPolling) {
              clearInterval(statusPolling);
              setStatusPolling(null);
            }
            if (qrPolling) {
              clearInterval(qrPolling);
              setQrPolling(null);
            }

            // Refresh sessions list to update UI
            fetchSessions();

            // Set a flag to show success message on next render instead of immediately
            if (isPhonePairingMode) {
              // Use setTimeout to defer the toast to the next tick
              setTimeout(() => {
                toast({
                  title: 'Phone Pairing Successful!',
                  description: 'Your WhatsApp device has been successfully connected via phone pairing.',
                });
              }, 0);
              setIsPhonePairingMode(false);
            } else {
              // Use setTimeout to defer the toast to the next tick
              setTimeout(() => {
                toast({
                  title: 'Success',
                  description: 'WhatsApp session successfully authenticated!',
                });
              }, 0);
            }
          }

          // Return the status data for use in initial checks
          return data.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching status:', error);
      return null;
    } finally {
      setIsGettingStatus(false);
    }
  };

  // Get QR Code
  const handleGetQR = async (session: WhatsAppSession) => {
    // Check subscription status first
    if (!hasSubscription) {
      toast({
        title: 'Subscription Required',
        description: 'Active WhatsApp subscription required to connect sessions',
        variant: 'destructive',
      });
      return;
    }

    // Check if quota is exceeded
    if (isQuotaExceeded) {
      toast({
        title: 'Session Quota Exceeded',
        description: `Please delete ${sessionsToDelete} session(s) first before connecting sessions. Your current plan allows only ${stats.maxSessions} sessions.`,
        variant: 'destructive',
      });
      return;
    }

    setSessionToControl(session);
    setQrCode('');
    setSessionStatus(null);
    setShowQrDialog(true);

    // Check if session is already logged in before starting polling
    const initialStatus = await fetchSessionStatus(session.sessionId);
    if (initialStatus?.loggedIn) {
      console.log('[QR_DIALOG] Session already logged in, not starting polling');
      return;
    }

    // Initial QR fetch
    await fetchQRCode(session.sessionId);

    // Status polling every 1 second - only if not already logged in
    const statusInterval = setInterval(async () => {
      console.log(`[QR_DIALOG] Polling status for session: ${session.sessionId}`);
      const currentStatus = await fetchSessionStatus(session.sessionId);
      if (currentStatus?.loggedIn) {
        console.log('[QR_DIALOG] Session logged in, clearing status interval');
        clearInterval(statusInterval);
        setStatusPolling(null);
      }
    }, 1000);
    setStatusPolling(statusInterval);

    // QR code polling every 2 seconds
    const qrInterval = setInterval(async () => {
      await fetchQRCode(session.sessionId);
    }, 2000);
    setQrPolling(qrInterval);
  };

  const fetchQRCode = async (sessionId: string) => {
    try {
      setIsGettingQR(true);
      const token = SessionManager.getToken();

      const response = await fetch(`/api/customer/whatsapp/sessions/${sessionId}/qr`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Check if session is already logged in
        if (data.data.alreadyLoggedIn) {
          // Stop polling since session is already connected
          if (statusPolling) {
            clearInterval(statusPolling);
            setStatusPolling(null);
          }
          if (qrPolling) {
            clearInterval(qrPolling);
            setQrPolling(null);
          }

          // Update session status to reflect connected state
          setSessionStatus({
            connected: true,
            loggedIn: true,
            name: data.data.sessionName || sessionToControl?.sessionName || '',
            id: sessionId,
            jid: '', // Will be updated from status API
            qrcode: '',
            token: sessionToControl?.token || '',
            webhook: '',
            events: '',
            proxy_config: { enabled: false, proxy_url: '' },
            s3_config: {
              enabled: false,
              endpoint: '',
              region: '',
              bucket: '',
              access_key: '',
              path_style: false,
              public_url: '',
              media_delivery: 'base64',
              retention_days: 30
            }
          });

          // Clear QR code and refresh sessions list
          setQrCode('');
          fetchSessions();

          // Show success message with setTimeout to defer to next render cycle
          setTimeout(() => {
            toast({
              title: 'Session Already Connected',
              description: 'This WhatsApp session is already authenticated and connected.',
            });
          }, 0);
        } else {
          // Normal QR code response
          setQrCode(data.data.QRCode || '');
        }
      } else {
        console.error('Failed to get QR:', data.error);
      }
    } catch (error) {
      console.error('Error getting QR:', error);
    } finally {
      setIsGettingQR(false);
    }
  };

  // Pair Phone
  const handlePairPhone = (session: WhatsAppSession) => {
    // Check subscription status first
    if (!hasSubscription) {
      toast({
        title: 'Subscription Required',
        description: 'Active WhatsApp subscription required to connect sessions',
        variant: 'destructive',
      });
      return;
    }

    // Check if quota is exceeded
    if (isQuotaExceeded) {
      toast({
        title: 'Session Quota Exceeded',
        description: `Please delete ${sessionsToDelete} session(s) first before connecting sessions. Your current plan allows only ${stats.maxSessions} sessions.`,
        variant: 'destructive',
      });
      return;
    }

    setSessionToControl(session);
    setPairPhoneForm({ Phone: '' });
    setLinkingCode('');
    setShowPairPhoneDialog(true);
  };

  const handleConfirmPairPhone = async () => {
    if (!sessionToControl || !pairPhoneForm.Phone) return;

    setIsPairingPhone(true);
    try {
      const token = SessionManager.getToken();

      const response = await fetch(`/api/customer/whatsapp/sessions/${sessionToControl.sessionId}/pairphone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pairPhoneForm),
      });

      const data = await response.json();
      if (data.success) {
        setLinkingCode(data.data.LinkingCode || '');
        toast({
          title: 'Success',
          description: 'Linking code generated successfully. Please enter this code on your phone.',
        });

        // Start status polling for phone pairing (without QR polling)
        console.log('[PHONE_PAIRING] Starting status polling for phone pairing...');
        setIsPhonePairingMode(true);
        
        // Check initial status before starting polling
        const initialStatus = await fetchSessionStatus(sessionToControl.sessionId);
        if (initialStatus?.loggedIn) {
          console.log('[PHONE_PAIRING] Session already logged in, not starting polling');
          return;
        }
        
        // Status polling every 1 second for phone pairing - only if not already logged in
        const statusInterval = setInterval(async () => {
          console.log(`[PHONE_PAIRING] Polling status for session: ${sessionToControl.sessionId}`);
          const currentStatus = await fetchSessionStatus(sessionToControl.sessionId);
          if (currentStatus?.loggedIn) {
            console.log('[PHONE_PAIRING] Session logged in, clearing status interval');
            clearInterval(statusInterval);
            setStatusPolling(null);
          }
        }, 1000);
        setStatusPolling(statusInterval);

      } else {
        throw new Error(data.error || 'Failed to generate pairing code');
      }
    } catch (error) {
      console.error('Error pairing phone:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate pairing code',
        variant: 'destructive',
      });
    } finally {
      setIsPairingPhone(false);
    }
  };

  // Disconnect Session
  const handleDisconnectSession = async (session: WhatsAppSession) => {
    setIsDisconnecting(true);
    try {
      const token = SessionManager.getToken();

      const response = await fetch(`/api/customer/whatsapp/sessions/${session.sessionId}/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: data.data.message || 'Session disconnected successfully',
        });
      } else {
        toast({
          title: 'Warning',
          description: data.error || 'Disconnect feature has some issues but local status updated',
          variant: 'destructive',
        });
      }
      fetchSessions();
    } catch (error) {
      console.error('Error disconnecting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect session',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Logout Session
  const handleLogoutSession = async (session: WhatsAppSession) => {
    setIsLoggingOut(true);
    try {
      const token = SessionManager.getToken();

      const response = await fetch(`/api/customer/whatsapp/sessions/${session.sessionId}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: data.data.message || 'Successfully logged out from WhatsApp',
        });
        fetchSessions();
      } else {
        throw new Error(data.error || 'Failed to logout');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error',
        description: 'Failed to logout from WhatsApp',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Close dialogs and cleanup
  const handleCloseStatusDialog = () => {
    setShowStatusDialog(false);
    setSessionToControl(null);
    setSessionStatus(null);
    setQrCode('');
    if (statusPolling) {
      clearInterval(statusPolling);
      setStatusPolling(null);
    }
  };

  const handleCloseQrDialog = () => {
    setShowQrDialog(false);
    setSessionToControl(null);
    setQrCode('');
    setSessionStatus(null);
    
    // Clear both QR and status polling
    if (qrPolling) {
      clearInterval(qrPolling);
      setQrPolling(null);
    }
    if (statusPolling) {
      clearInterval(statusPolling);
      setStatusPolling(null);
    }
  };

  const handleClosePairPhoneDialog = () => {
    setShowPairPhoneDialog(false);
    setSessionToControl(null);
    setPairPhoneForm({ Phone: '' });
    setLinkingCode('');
    setIsPhonePairingMode(false);
    
    // Clear any running status polling for phone pairing
    if (statusPolling) {
      clearInterval(statusPolling);
      setStatusPolling(null);
    }
  };

  const handleCloseConnectDialog = () => {
    setShowConnectDialog(false);
    setSessionToControl(null);
    setConnectForm({
      Subscribe: [],
      Immediate: true
    });
  };

  // Fetch available webhook events from external service (for create dialog)
  const fetchWebhookEventsForCreate = async () => {
    console.log('📡 fetchWebhookEventsForCreate started...');
    try {
      setIsLoadingEvents(true);
      console.log('🔄 Set loading events to true');
      
      // Fetch events from WhatsApp Go server public endpoint
      console.log('🌐 Making API call to: /api/public/whatsapp/webhook/events');
      const response = await fetch('/api/public/whatsapp/webhook/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📥 API Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API Response data:', data);
        
        if (data.success && data.data) {
          // Use active_events for the main selection
          const activeEvents = data.data.active_events || [];
          const allSupportedEvents = data.data.all_supported_events || [];
          
          console.log('✅ Using API events:', {
            active_events_count: activeEvents.length,
            active_events: activeEvents,
            all_supported_count: allSupportedEvents.length
          });
          
          setAvailableWebhookEvents(activeEvents);
          setAllSupportedEvents(allSupportedEvents);
        } else {
          console.log('❌ API response not successful, using fallback events');
          console.log('Response data:', data);
          // Fallback to hardcoded events if API doesn't return proper data
          setAvailableWebhookEvents(WEBHOOK_EVENTS);
          setAllSupportedEvents(WEBHOOK_EVENTS);
        }
      } else {
        console.log('❌ API response not ok, using fallback events');
        const errorText = await response.text();
        console.log('Error response:', errorText);
        // Fallback to hardcoded events if API fails
        setAvailableWebhookEvents(WEBHOOK_EVENTS);
        setAllSupportedEvents(WEBHOOK_EVENTS);
      }
      
      // After fetching events, ensure state remains at "Message" default
      console.log('🔧 Resetting state to Message default...');
      setSelectedEvents(["Message"]);
      setIsAllEvents(false);
      setCreateForm(prev => ({ ...prev, events: 'Message' }));
      
    } catch (error) {
      console.error('💥 Error fetching webhook events for create:', error);
      // Fallback to hardcoded events if anything fails
      setAvailableWebhookEvents(WEBHOOK_EVENTS);
      setAllSupportedEvents(WEBHOOK_EVENTS);
      
      // Ensure state remains at "Message" default even on error
      setSelectedEvents(["Message"]);
      setIsAllEvents(false);
      setCreateForm(prev => ({ ...prev, events: 'Message' }));
    } finally {
      console.log('🏁 fetchWebhookEventsForCreate finished, setting loading to false');
      setIsLoadingEvents(false);
    }
  };

  // Handle opening create dialog
  const handleOpenCreateDialog = () => {
    console.log('🚀 Opening create dialog...');
    
    // Reset states to proper defaults
    setSelectedEvents(["Message"]); // Default to Message only
    setIsAllEvents(false); // Default to false (not all events)
    setCreateForm({
      name: '',
      token: '',
      webhook: '',
      events: 'Message', // Default to Message
      proxyConfig: {
        enabled: false,
        proxyURL: ''
      },
      s3Config: {
        enabled: false,
        endpoint: '',
        region: '',
        bucket: '',
        accessKey: '',
        secretKey: '',
        pathStyle: false,
        publicURL: '',
        mediaDelivery: 'base64',
        retentionDays: 30
      }
    });
    
    console.log('🔄 State reset complete, opening dialog...');
    setShowCreateDialog(true);
    
    console.log('📡 Starting to fetch webhook events...');
    // Fetch available webhook events when opening create dialog
    fetchWebhookEventsForCreate();
  };

  // Fetch available webhook events from external service
  const fetchWebhookEvents = async (sessionToken: string) => {
    try {
      setIsLoadingEvents(true);

      // Use the same public endpoint for consistency
      const response = await fetch('/api/public/whatsapp/webhook/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Use active_events for the main selection
          const activeEvents = data.data.active_events || [];
          const allSupportedEvents = data.data.all_supported_events || [];
          
          setAvailableWebhookEvents(activeEvents);
          setAllSupportedEvents(allSupportedEvents);
          
          console.log('Fetched webhook events for advanced edit:', {
            active_events: activeEvents,
            all_supported_events: allSupportedEvents
          });
        } else {
          console.log('API response not successful for advanced edit, using fallback events');
          // Fallback to hardcoded events
          setAvailableWebhookEvents(WEBHOOK_EVENTS);
          setAllSupportedEvents(WEBHOOK_EVENTS);
        }
      } else {
        console.log('API response not ok for advanced edit, using fallback events');
        // Fallback to hardcoded events
        setAvailableWebhookEvents(WEBHOOK_EVENTS);
        setAllSupportedEvents(WEBHOOK_EVENTS);
      }
    } catch (error) {
      console.error('Error fetching webhook events:', error);
      // Fallback to hardcoded events on error
      setAvailableWebhookEvents(WEBHOOK_EVENTS);
      setAllSupportedEvents(WEBHOOK_EVENTS);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Handle advanced edit session (webhook, proxy, s3)
  const handleAdvancedEditSession = async (session: WhatsAppSession) => {
    // Check subscription status first
    if (!hasSubscription) {
      toast({
        title: 'Subscription Required',
        description: 'Active WhatsApp subscription required to edit sessions',
        variant: 'destructive',
      });
      return;
    }

    // Check if quota is exceeded
    if (isQuotaExceeded) {
      toast({
        title: 'Session Quota Exceeded',
        description: `Please delete ${sessionsToDelete} session(s) first before editing sessions. Your current plan allows only ${stats.maxSessions} sessions.`,
        variant: 'destructive',
      });
      return;
    }

    setSessionToEdit(session);
    
    // Fetch available events from external service first
    await fetchWebhookEvents(session.sessionId);
    
    // Set form with current session data
    const currentEvents = session.events ? (session.events === 'All' ? [] : session.events.split(',').map(e => e.trim())) : [];
    // Ensure "Message" is always included in the events list
    const eventsWithMessage = session.events === 'All' ? [] : (currentEvents.includes('Message') ? currentEvents : [...currentEvents, 'Message']);
    
    const formData = {
      webhook: {
        url: session.webhook || '',
        events: eventsWithMessage,
        allEvents: !session.events || session.events === 'All'
      },
      proxy: {
        enabled: session.proxyEnabled || false,
        url: session.proxyUrl || ''
      },
      s3: {
        enabled: session.s3Enabled || false,
        endpoint: session.s3Endpoint || '',
        region: session.s3Region || '',
        bucket: session.s3Bucket || '',
        accessKeyId: session.s3AccessKey || '',
        secretAccessKey: session.s3SecretKey || '',
        pathStyle: session.s3PathStyle || false,
        publicUrl: session.s3PublicUrl || '',
        mediaDelivery: session.s3MediaDelivery || 'base64',
        retentionDays: session.s3RetentionDays || 30
      }
    };
    
    setEditFormData(formData);
    setOriginalEditFormData(JSON.parse(JSON.stringify(formData)));
    setShowAdvancedEditDialog(true);
  };

  // Detect form changes
  const hasAdvancedFormChanges = React.useCallback(() => {
    return JSON.stringify(editFormData) !== JSON.stringify(originalEditFormData);
  }, [editFormData, originalEditFormData]);

  // Update hasUnsavedChanges whenever form changes
  useEffect(() => {
    setHasUnsavedChanges(hasAdvancedFormChanges());
  }, [hasAdvancedFormChanges]);

  // Close advanced edit dialog
  const handleCloseAdvancedEditDialog = () => {
    setShowAdvancedEditDialog(false);
    setSessionToEdit(null);
    setEditFormData({
      webhook: { url: '', events: ['Message'], allEvents: false }, // Ensure Message is always included when resetting
      proxy: { enabled: false, url: '' },
      s3: {
        enabled: false, endpoint: '', region: '', bucket: '',
        accessKeyId: '', secretAccessKey: '', pathStyle: false,
        publicUrl: '', mediaDelivery: 'base64', retentionDays: 30
      }
    });
    setOriginalEditFormData({
      webhook: { url: '', events: ['Message'], allEvents: false }, // Ensure Message is always included when resetting
      proxy: { enabled: false, url: '' },
      s3: {
        enabled: false, endpoint: '', region: '', bucket: '',
        accessKeyId: '', secretAccessKey: '', pathStyle: false,
        publicUrl: '', mediaDelivery: 'base64', retentionDays: 30
      }
    });
    setHasUnsavedChanges(false);
  };

  // Get changed fields
  const getChangedFields = () => {
    const changes: any = {};
    
    if (editFormData.webhook.url !== originalEditFormData.webhook.url) {
      changes.webhook = true;
    }
    if (JSON.stringify(editFormData.webhook.events) !== JSON.stringify(originalEditFormData.webhook.events) ||
        editFormData.webhook.allEvents !== originalEditFormData.webhook.allEvents) {
      changes.webhook = true;
    }
    if (editFormData.proxy.enabled !== originalEditFormData.proxy.enabled || 
        editFormData.proxy.url !== originalEditFormData.proxy.url) {
      changes.proxy = true;
    }
    if (editFormData.s3.enabled !== originalEditFormData.s3.enabled ||
        editFormData.s3.endpoint !== originalEditFormData.s3.endpoint ||
        editFormData.s3.region !== originalEditFormData.s3.region ||
        editFormData.s3.bucket !== originalEditFormData.s3.bucket ||
        editFormData.s3.accessKeyId !== originalEditFormData.s3.accessKeyId ||
        editFormData.s3.secretAccessKey !== originalEditFormData.s3.secretAccessKey ||
        editFormData.s3.pathStyle !== originalEditFormData.s3.pathStyle ||
        editFormData.s3.publicUrl !== originalEditFormData.s3.publicUrl ||
        editFormData.s3.mediaDelivery !== originalEditFormData.s3.mediaDelivery ||
        editFormData.s3.retentionDays !== originalEditFormData.s3.retentionDays) {
      changes.s3 = true;
    }
    
    return changes;
  };

  // Save advanced configuration changes
  const handleSaveAdvancedChanges = async () => {
    if (!sessionToEdit) return;

    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      toast({
        title: 'No Changes',
        description: 'No changes detected to save.',
      });
      return;
    }

    setIsSavingAdvanced(true);
    try {
      const token = SessionManager.getToken();
      const results = [];

      // Update webhook if changed
      if (changes.webhook) {
        try {
          // Prepare events data - ensure "Message" is always included and never empty
          let eventsToSend: string[];
          if (editFormData.webhook.allEvents) {
            eventsToSend = ['All'];
          } else {
            // Make sure "Message" is included
            const finalEvents = editFormData.webhook.events.includes('Message') 
              ? editFormData.webhook.events 
              : [...editFormData.webhook.events, 'Message'];
            // If no events selected or empty, default to ["Message"]
            eventsToSend = finalEvents.length > 0 ? finalEvents : ['Message'];
          }

          const webhookResponse = await fetch(`/api/customer/whatsapp/sessions/${sessionToEdit.sessionId}/webhook`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              WebhookURL: editFormData.webhook.url,
              Events: eventsToSend // Always ensure Message is included and never empty
            }),
          });

          if (webhookResponse.ok) {
            results.push('Webhook configuration updated successfully');
          } else {
            const errorData = await webhookResponse.json();
            results.push(`Webhook error: ${errorData.error || 'Failed to update'}`);
          }
        } catch (error) {
          results.push(`Webhook error: ${error}`);
        }
      }

      // Update proxy if changed
      if (changes.proxy) {
        try {
          // Disconnect session first if proxy is being enabled/changed and session is connected
          if (sessionToEdit.connected && editFormData.proxy.enabled) {
            await fetch(`/api/customer/whatsapp/sessions/${sessionToEdit.sessionId}/disconnect`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
          }

          const proxyResponse = await fetch(`/api/customer/whatsapp/sessions/${sessionToEdit.sessionId}/proxy`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              proxy_url: editFormData.proxy.url,
              enable: editFormData.proxy.enabled
            }),
          });

          if (proxyResponse.ok) {
            results.push('Proxy configuration updated successfully');
            if (sessionToEdit.connected && editFormData.proxy.enabled) {
              results.push('Session disconnected due to proxy changes');
            }
          } else {
            const errorData = await proxyResponse.json();
            results.push(`Proxy error: ${errorData.error || 'Failed to update'}`);
          }
        } catch (error) {
          results.push(`Proxy error: ${error}`);
        }
      }

      // Update S3 if changed
      if (changes.s3) {
        try {
          const s3Response = await fetch(`/api/customer/whatsapp/sessions/${sessionToEdit.sessionId}/s3/config`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              enabled: editFormData.s3.enabled,
              endpoint: editFormData.s3.endpoint,
              region: editFormData.s3.region,
              bucket: editFormData.s3.bucket,
              access_key: editFormData.s3.accessKeyId,
              secret_key: editFormData.s3.secretAccessKey,
              path_style: editFormData.s3.pathStyle,
              public_url: editFormData.s3.publicUrl,
              media_delivery: editFormData.s3.mediaDelivery,
              retention_days: editFormData.s3.retentionDays
            }),
          });

          if (s3Response.ok) {
            results.push('S3 configuration updated successfully');
          } else {
            const errorData = await s3Response.json();
            results.push(`S3 error: ${errorData.error || 'Failed to update'}`);
          }
        } catch (error) {
          results.push(`S3 error: ${error}`);
        }
      }

      // Show results
      if (results.length > 0) {
        toast({
          title: 'Configuration Updated',
          description: results.join('. '),
        });
        
        // Refresh sessions
        fetchSessions();
        handleCloseAdvancedEditDialog();
      }

    } catch (error) {
      console.error('Error saving advanced changes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration changes',
        variant: 'destructive',
      });
    } finally {
      setIsSavingAdvanced(false);
    }
  };

  // Delete proxy configuration
  const handleDeleteProxy = async () => {
    if (!sessionToEdit) return;

    setIsDeletingProxy(true);
    try {
      const token = SessionManager.getToken();

      // Disconnect session first if connected
      if (sessionToEdit.connected) {
        await fetch(`/api/customer/whatsapp/sessions/${sessionToEdit.sessionId}/disconnect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      const response = await fetch(`/api/customer/whatsapp/sessions/${sessionToEdit.sessionId}/proxy`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Proxy configuration deleted successfully',
        });
        
        // Update form
        setEditFormData(prev => ({
          ...prev,
          proxy: {
            ...prev.proxy,
            enabled: false,
            url: ''
          }
        }));
        
        fetchSessions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete proxy');
      }
    } catch (error) {
      console.error('Error deleting proxy:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete proxy configuration',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingProxy(false);
    }
  };

  // Delete webhook configuration
  const handleDeleteWebhook = async () => {
    if (!sessionToEdit) return;

    setIsDeletingWebhook(true);
    try {
      const token = SessionManager.getToken();

      const response = await fetch(`/api/customer/whatsapp/sessions/${sessionToEdit.sessionId}/webhook`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Webhook configuration deleted successfully',
        });
        
        // Update form
        setEditFormData(prev => ({
          ...prev,
          webhook: {
            ...prev.webhook,
            url: '',
            events: ['All']
          }
        }));
        
        fetchSessions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete webhook');
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete webhook configuration',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingWebhook(false);
    }
  };

  // Delete S3 configuration
  const handleDeleteS3 = async () => {
    if (!sessionToEdit) return;

    try {
      const token = SessionManager.getToken();

      const response = await fetch(`/api/customer/whatsapp/sessions/${sessionToEdit.sessionId}/s3/config`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'S3 configuration deleted successfully',
        });
        
        // Update form
        setEditFormData(prev => ({
          ...prev,
          s3: {
            enabled: false,
            endpoint: '',
            region: '',
            bucket: '',
            accessKeyId: '',
            secretAccessKey: '',
            pathStyle: false,
            publicUrl: '',
            mediaDelivery: 'base64',
            retentionDays: 30
          }
        }));
        
        fetchSessions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete S3 configuration');
      }
    } catch (error) {
      console.error('Error deleting S3:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete S3 configuration',
        variant: 'destructive',
      });
    }
  };

  // Handle webhook URL changes (local state only)
  const handleWebhookChange = (sessionId: string, webhookUrl: string) => {
    // Update local edit state
    setWebhookEdits(prev => ({
      ...prev,
      [sessionId]: webhookUrl
    }));
  };

  // Save webhook URL to server
  const handleSaveWebhook = async (sessionId: string) => {
    // Check subscription status first
    if (!hasSubscription) {
      toast({
        title: 'Subscription Required',
        description: 'Active WhatsApp subscription required to edit sessions',
        variant: 'destructive',
      });
      return;
    }

    // Check if quota is exceeded
    if (isQuotaExceeded) {
      toast({
        title: 'Session Quota Exceeded',
        description: `Please delete ${sessionsToDelete} session(s) first before editing sessions. Your current plan allows only ${stats.maxSessions} sessions.`,
        variant: 'destructive',
      });
      return;
    }

    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const webhookUrl = webhookEdits[sessionId] ?? session.webhook ?? '';

    try {
      setSavingWebhook(prev => ({ ...prev, [sessionId]: true }));
      const token = SessionManager.getToken();

      // Get current session events to send along with webhook URL
      // If session has no events or events is 'All', send ['All']
      // Otherwise, parse the events string and send as array
      let eventsToSend: string[] = ['All'];
      
      if (session.events && session.events !== 'All' && session.events.trim() !== '') {
        // Parse the events string - could be comma-separated
        eventsToSend = session.events.split(',').map(e => e.trim()).filter(e => e !== '');
        
        // If no valid events found, default to 'All'
        if (eventsToSend.length === 0) {
          eventsToSend = ['All'];
        }
      }

      console.log('Saving webhook with events:', {
        sessionId: session.sessionId,
        webhookUrl,
        events: eventsToSend,
        originalEvents: session.events
      });

      const response = await fetch(`/api/customer/whatsapp/sessions/${session.sessionId}/webhook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          WebhookURL: webhookUrl,
          Events: eventsToSend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save webhook');
      }

      // Clear edit state for this session
      setWebhookEdits(prev => {
        const newState = { ...prev };
        delete newState[sessionId];
        return newState;
      });

      toast({
        title: 'Success',
        description: 'Webhook URL saved successfully',
      });

      // Refresh sessions to get updated data
      fetchSessions();
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save webhook URL',
        variant: 'destructive',
      });
    } finally {
      setSavingWebhook(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  // Handle show token
  const handleShowToken = (session: WhatsAppSession) => {
    setSelectedSession(session);
    setShowTokenDialog(true);
  };

  // Handle confirm show token
  const handleConfirmShowToken = () => {
    // Token is already available in selectedSession.token or selectedSession.sessionId
    setShowTokenDialog(false);
  };

  // Get status badge variant
  const getStatusBadge = (session: WhatsAppSession) => {
    if (session.connected && session.loggedIn) {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Connected
      </Badge>;
    } else if (!session.connected) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Disconnected
      </Badge>;
    } else if (!session.loggedIn) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
        <QrCode className="w-3 h-3 mr-1" />
        QR Required
      </Badge>;
    } else {
      return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Apply filters
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchTerm ||
      session.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.jid && session.jid.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = !statusFilter || statusFilter === 'all' ||
      (statusFilter === 'connected' && session.connected && session.loggedIn) ||
      (statusFilter === 'disconnected' && !session.connected) ||
      (statusFilter === 'qr_required' && !session.loggedIn && !session.connected);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (statusPolling) {
        clearInterval(statusPolling);
      }
      if (qrPolling) {
        clearInterval(qrPolling);
      }
    };
  }, [statusPolling, qrPolling]);

  return (
    <SubscriptionGuard featureName="WhatsApp Sessions" showRefreshButton={true}>
      <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">WhatsApp Sessions</h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button 
            onClick={() => fetchSessions()} 
            disabled={isLoading} 
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
          >
            <RefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            onClick={handleOpenCreateDialog}
            disabled={isQuotaExceeded || !hasSubscription}
            className={`h-8 sm:h-9 md:h-10 text-xs sm:text-sm ${isQuotaExceeded ? 'opacity-50 cursor-not-allowed' : ''}`}
            size="sm"
          >
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add Session</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card className={isQuotaExceeded ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Session Usage</CardTitle>
            <ShieldCheck className={`h-3 w-3 sm:h-4 sm:w-4 ${isQuotaExceeded ? 'text-red-600' : 'text-purple-600'}`} />
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${isQuotaExceeded ? 'text-red-600' : 'text-purple-600'}`}>
              {stats.currentSessions}/{stats.maxSessions}
            </div>
            <p className={`text-[10px] sm:text-xs ${isQuotaExceeded ? 'text-red-600' : 'text-muted-foreground'}`}>
              {stats.packageName || 'Package'} plan
              {isQuotaExceeded && ' - QUOTA EXCEEDED!'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Connected</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.connectedSessions}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Currently connected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Disconnected</CardTitle>
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.disconnectedSessions}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Not connected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">QR Required</CardTitle>
            <QrCode className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{stats.qrRequiredSessions}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Need QR scan
            </p>
          </CardContent>
        </Card>
        
      </div>

      {/* Quota Exceeded Warning */}
      {isQuotaExceeded && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-red-800">
                Session Quota Exceeded
              </h3>
              <p className="text-xs sm:text-sm text-red-700 mt-1">
                You currently have <span className="font-semibold">{stats.totalSessions} sessions</span> but your <span className="font-semibold">{stats.packageName}</span> plan allows only <span className="font-semibold">{stats.maxSessions} sessions</span>.
              </p>
              <p className="text-xs sm:text-sm text-red-700 mt-1 sm:mt-2">
                Please delete <span className="font-semibold">{sessionsToDelete} session(s)</span> to continue using WhatsApp services such as creating sessions, connecting, or managing existing sessions.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 sm:pt-2">
            <p className="text-[10px] sm:text-xs text-red-600">
              💡 Tip: Use the delete button in the table rows below to remove unwanted sessions
            </p>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3 md:pb-4">
          <CardTitle className="text-sm sm:text-base md:text-lg">WhatsApp Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions by name, ID, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 sm:pl-8 h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="disconnected">Disconnected</SelectItem>
                <SelectItem value="qr_required">QR Required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-6 sm:py-8">
              <RefreshCw className="mx-auto h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Loading sessions...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <MessageSquare className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground/50" />
              <p className="mt-2 text-xs sm:text-sm">No sessions found matching your criteria.</p>
            </div>
          ) : (
            <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Session Name</TableHead>
                    <TableHead className="text-xs">Phone Number</TableHead>
                    <TableHead className="text-xs">Connected</TableHead>
                    <TableHead className="text-xs">Logged In</TableHead>
                    <TableHead className="text-xs">Webhook URL</TableHead>
                    <TableHead className="text-xs">Token</TableHead>
                    <TableHead className="text-xs">Auto Read</TableHead>
                    <TableHead className="text-xs">Typing</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{session.name || session.sessionName}</div>
                      </TableCell>
                      <TableCell>
                        {session.loggedIn && session.jid ? (
                          <div className="font-mono text-xs">
                            {session.jid.split(':')[0]}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-xs">-</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {!session.connected && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectSession(session)}
                            disabled={isConnecting}
                            className="h-7 text-xs"
                          >
                            <Zap className="mr-1 h-3 w-3" />
                            {isConnecting ? 'Connecting...' : 'Connect'}
                          </Button>
                        )}
                        {session.connected && (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.loggedIn ? "default" : "secondary"} className={`text-xs ${session.loggedIn ? "bg-green-100 text-green-800" : "bg-red-400 text-white"}`}>
                          {session.loggedIn ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Logged In
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Not Logged In
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-[250px]">
                          <Input
                            value={(webhookEdits[session.id] ?? session.webhook) || ''}
                            onChange={(e) => handleWebhookChange(session.id, e.target.value)}
                            placeholder="Enter webhook URL"
                            className="text-xs h-7 flex-1"
                            maxLength={200}
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSaveWebhook(session.id)}
                                  disabled={
                                    savingWebhook[session.id] || 
                                    webhookEdits[session.id] === undefined ||
                                    webhookEdits[session.id] === (session.webhook || '')
                                  }
                                  className="h-7 px-2 hover:bg-muted transition-colors"
                                >
                                  {savingWebhook[session.id] ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Send className="h-3 w-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{savingWebhook[session.id] ? 'Saving webhook...' : 'Save webhook URL'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShowToken(session)}
                                className="h-7 px-2 text-xs hover:bg-muted transition-colors"
                              >
                                <Lock className="h-3 w-3 mr-1" />
                                Show Token
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View and copy the session token</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={session.autoReadMessages || false}
                                    onCheckedChange={() => handleToggleAutoRead(session.sessionId, session.autoReadMessages || false)}
                                    disabled={session.hasActiveBot || togglingAutoRead[session.sessionId] || !hasSubscription || isQuotaExceeded}
                                    className="h-5 w-9"
                                  />
                                  {togglingAutoRead[session.sessionId] && (
                                    <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {session.hasActiveBot ? (
                                  <p>Managed by AI Bot: {session.aiBotInfo?.botName || 'Unknown'} (always enabled)</p>
                                ) : (
                                  <p>{session.autoReadMessages ? 'Auto-read enabled' : 'Auto-read disabled'}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={session.typingIndicator || false}
                                    onCheckedChange={() => handleToggleTyping(session.sessionId, session.typingIndicator || false)}
                                    disabled={session.hasActiveBot || togglingTyping[session.sessionId] || !hasSubscription || isQuotaExceeded}
                                    className="h-5 w-9"
                                  />
                                  {togglingTyping[session.sessionId] && (
                                    <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {session.hasActiveBot ? (
                                  <p>Managed by AI Bot: {session.aiBotInfo?.botName || 'Unknown'} (always enabled)</p>
                                ) : (
                                  <p>{session.typingIndicator ? 'Typing indicator enabled' : 'Typing indicator disabled'}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Show delete button directly when quota exceeded */}
                          {isQuotaExceeded && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteClick(session)}
                                    className="h-7 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete session to reduce quota</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(session)}>
                              <Eye className="mr-2 h-3 w-3" />
                              View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleAdvancedEditSession(session)}>
                              <Settings className="mr-2 h-3 w-3" />
                              Advanced Settings
                            </DropdownMenuItem>

                            {/* Session Control Actions */}
                            <DropdownMenuItem onClick={() => handleGetStatus(session)}>
                              <Activity className="mr-2 h-3 w-3" />
                              Monitor Status
                            </DropdownMenuItem>

                            {session.connected && !session.loggedIn && (
                              <>
                                <DropdownMenuItem onClick={() => handleGetQR(session)}>
                                  <QrCode className="mr-2 h-3 w-3" />
                                  Show QR Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePairPhone(session)}>
                                  <Phone className="mr-2 h-3 w-3" />
                                  Pair Phone
                                </DropdownMenuItem>
                              </>
                            )}

                            {session.connected && (
                              <DropdownMenuItem
                                onClick={() => handleDisconnectSession(session)}
                                disabled={isDisconnecting}
                              >
                                <XCircle className="mr-2 h-3 w-3" />
                                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                              </DropdownMenuItem>
                            )}

                            {session.loggedIn && (
                              <DropdownMenuItem
                                onClick={() => handleLogoutSession(session)}
                                disabled={isLoggingOut}
                              >
                                <Settings className="mr-2 h-3 w-3" />
                                {isLoggingOut ? 'Logging out...' : 'Logout WhatsApp'}
                              </DropdownMenuItem>
                            )}

                            {/* Customer Actions - No Transfer */}
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(session)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete Session
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
              <div className="space-y-2 sm:space-y-3">
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="border">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm sm:text-base truncate">
                            {session.name || session.sessionName}
                          </h3>
                          {session.loggedIn && session.jid ? (
                            <p className="font-mono text-xs sm:text-sm text-muted-foreground mt-1">
                              {session.jid.split(':')[0]}
                            </p>
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">No phone number</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {isQuotaExceeded && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(session)}
                              className="h-7 w-7 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-7 w-7 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(session)}>
                                <Eye className="mr-2 h-3 w-3" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAdvancedEditSession(session)}>
                                <Settings className="mr-2 h-3 w-3" />
                                Advanced Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleGetStatus(session)}>
                                <Activity className="mr-2 h-3 w-3" />
                                Monitor Status
                              </DropdownMenuItem>
                              {session.connected && !session.loggedIn && (
                                <>
                                  <DropdownMenuItem onClick={() => handleGetQR(session)}>
                                    <QrCode className="mr-2 h-3 w-3" />
                                    Show QR Code
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePairPhone(session)}>
                                    <Phone className="mr-2 h-3 w-3" />
                                    Pair Phone
                                  </DropdownMenuItem>
                                </>
                              )}
                              {session.connected && (
                                <DropdownMenuItem
                                  onClick={() => handleDisconnectSession(session)}
                                  disabled={isDisconnecting}
                                >
                                  <XCircle className="mr-2 h-3 w-3" />
                                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                                </DropdownMenuItem>
                              )}
                              {session.loggedIn && (
                                <DropdownMenuItem
                                  onClick={() => handleLogoutSession(session)}
                                  disabled={isLoggingOut}
                                >
                                  <Settings className="mr-2 h-3 w-3" />
                                  {isLoggingOut ? 'Logging out...' : 'Logout WhatsApp'}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(session)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete Session
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Connection Status */}
                        {!session.connected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectSession(session)}
                            disabled={isConnecting}
                            className="h-6 text-xs px-2"
                          >
                            <Zap className="mr-1 h-3 w-3" />
                            {isConnecting ? 'Connecting...' : 'Connect'}
                          </Button>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs px-2 py-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}

                        {/* Login Status */}
                        <Badge 
                          variant={session.loggedIn ? "default" : "secondary"} 
                          className={`text-xs px-2 py-1 ${session.loggedIn ? "bg-green-100 text-green-800" : "bg-red-400 text-white"}`}
                        >
                          {session.loggedIn ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Logged In
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Not Logged In
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Webhook URL */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={(webhookEdits[session.id] ?? session.webhook) || ''}
                            onChange={(e) => handleWebhookChange(session.id, e.target.value)}
                            placeholder="Enter webhook URL"
                            className="text-xs h-7 flex-1"
                            maxLength={200}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveWebhook(session.id)}
                            disabled={
                              savingWebhook[session.id] || 
                              webhookEdits[session.id] === undefined ||
                              webhookEdits[session.id] === (session.webhook || '')
                            }
                            className="h-7 px-2 hover:bg-muted transition-colors"
                          >
                            {savingWebhook[session.id] ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                          </Button>
                        </div>

                        {/* Token Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowToken(session)}
                          className="h-7 text-xs hover:bg-muted transition-colors w-full sm:w-auto"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Show Token
                        </Button>

                        {/* Auto Read Toggle */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex flex-col gap-0.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">Auto Read Messages</span>
                                {togglingAutoRead[session.sessionId] && (
                                  <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                                )}
                              </div>
                              {session.hasActiveBot && (
                                <span className="text-[10px] text-muted-foreground">
                                  Managed by: {session.aiBotInfo?.botName || 'AI Bot'}
                                </span>
                              )}
                            </div>
                          </div>
                          <Switch
                            checked={session.autoReadMessages || false}
                            onCheckedChange={() => handleToggleAutoRead(session.sessionId, session.autoReadMessages || false)}
                            disabled={session.hasActiveBot || togglingAutoRead[session.sessionId] || !hasSubscription || isQuotaExceeded}
                            className="h-5 w-9"
                          />
                        </div>

                        {/* Typing Indicator Toggle */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex flex-col gap-0.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">Typing Indicator</span>
                                {togglingTyping[session.sessionId] && (
                                  <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                                )}
                              </div>
                              {session.hasActiveBot && (
                                <span className="text-[10px] text-muted-foreground">
                                  Managed by: {session.aiBotInfo?.botName || 'AI Bot'}
                                </span>
                              )}
                            </div>
                          </div>
                          <Switch
                            checked={session.typingIndicator || false}
                            onCheckedChange={() => handleToggleTyping(session.sessionId, session.typingIndicator || false)}
                            disabled={session.hasActiveBot || togglingTyping[session.sessionId] || !hasSubscription || isQuotaExceeded}
                            className="h-5 w-9"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Create New WhatsApp Session</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Add a new WhatsApp session to your WhatsApp Go service.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm">Session Name *</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., customer-session-1"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token" className="text-xs sm:text-sm">Session Token *</Label>
                <Input
                  id="token"
                  value={createForm.token}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="Enter unique token"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook" className="text-xs sm:text-sm">Webhook URL</Label>
              <Input
                id="webhook"
                value={createForm.webhook}
                onChange={(e) => setCreateForm(prev => ({ ...prev, webhook: e.target.value }))}
                placeholder="https://example.com/webhook"
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm">Webhook Events</Label>
              {isLoadingEvents ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Loading events...</span>
                </div>
              ) : (
                <div className="border rounded-lg p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 max-h-48 overflow-y-auto">
                  {/* All Events Toggle */}
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id="all-events-create"
                      checked={isAllEvents}
                      onCheckedChange={handleAllEventsToggle}
                      className="h-3 w-3 sm:h-4 sm:w-4"
                    />
                    <Label htmlFor="all-events-create" className="text-xs sm:text-sm font-medium">
                      All Events {isAllEvents && availableWebhookEvents.length > 0 && `(${availableWebhookEvents.length} events)`}
                    </Label>
                  </div>

                  {/* Individual Events (shown only when not "All") */}
                  {!isAllEvents && availableWebhookEvents.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableWebhookEvents.map((event) => {
                        const isMessageEvent = event === "Message";
                        const isChecked = selectedEvents.includes(event) || isMessageEvent; // Message is always checked
                        
                        return (
                          <div key={event} className="flex items-center space-x-2">
                            <Checkbox
                              id={`create-event-${event}`}
                              checked={isChecked}
                              disabled={isMessageEvent} // Disable Message checkbox
                              onCheckedChange={(checked) => handleEventToggle(event, !!checked)}
                              className="h-3 w-3 sm:h-4 sm:w-4"
                            />
                            <Label 
                              htmlFor={`create-event-${event}`} 
                              className={`text-[10px] sm:text-xs ${isMessageEvent ? 'font-medium text-orange-600' : ''}`}
                            >
                              {event} {isMessageEvent && '(Required)'}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected count when not all */}
                  {!isAllEvents && selectedEvents.length > 0 && (
                    <div className="text-[10px] sm:text-xs text-muted-foreground pt-2 border-t">
                      Selected: {Math.max(selectedEvents.length, 1)} of {availableWebhookEvents.length} events
                      <span className="text-orange-600 ml-2">(Message is required)</span>
                    </div>
                  )}

                  {/* Fallback to hardcoded events if API events not available */}
                  {!isAllEvents && availableWebhookEvents.length === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {WEBHOOK_EVENTS.map((event) => {
                        const isMessageEvent = event === "Message";
                        const isChecked = selectedEvents.includes(event) || isMessageEvent; // Message is always checked
                        
                        return (
                          <div key={event} className="flex items-center space-x-2">
                            <Checkbox
                              id={`fallback-event-${event}`}
                              checked={isChecked}
                              disabled={isMessageEvent} // Disable Message checkbox
                              onCheckedChange={(checked) => handleEventToggle(event, !!checked)}
                              className="h-3 w-3 sm:h-4 sm:w-4"
                            />
                            <Label 
                              htmlFor={`fallback-event-${event}`} 
                              className={`text-[10px] sm:text-xs ${isMessageEvent ? 'font-medium text-orange-600' : ''}`}
                            >
                              {event} {isMessageEvent && '(Required)'}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Proxy Configuration */}
            <div className="space-y-2 sm:space-y-3 border-t pt-3 sm:pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="proxy-enabled"
                  checked={createForm.proxyConfig.enabled}
                  onCheckedChange={(checked) =>
                    setCreateForm(prev => ({
                      ...prev,
                      proxyConfig: { ...prev.proxyConfig, enabled: !!checked }
                    }))
                  }
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <Label htmlFor="proxy-enabled" className="text-xs sm:text-sm font-medium">
                  Enable Proxy Configuration
                </Label>
              </div>
              {createForm.proxyConfig.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="proxy-url" className="text-xs sm:text-sm">Proxy URL</Label>
                  <Input
                    id="proxy-url"
                    value={createForm.proxyConfig.proxyURL}
                    onChange={(e) => setCreateForm(prev => ({
                      ...prev,
                      proxyConfig: { ...prev.proxyConfig, proxyURL: e.target.value }
                    }))}
                    placeholder="socks5://user:pass@host:port"
                  />
                </div>
              )}
            </div>

            {/* S3 Configuration */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="s3-enabled"
                  checked={createForm.s3Config.enabled}
                  onCheckedChange={(checked) =>
                    setCreateForm(prev => ({
                      ...prev,
                      s3Config: { ...prev.s3Config, enabled: !!checked }
                    }))
                  }
                />
                <Label htmlFor="s3-enabled" className="text-sm font-medium">
                  Enable S3 Storage Configuration
                </Label>
              </div>
              {createForm.s3Config.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="s3-endpoint">S3 Endpoint</Label>
                      <Input
                        id="s3-endpoint"
                        value={createForm.s3Config.endpoint}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          s3Config: { ...prev.s3Config, endpoint: e.target.value }
                        }))}
                        placeholder="https://s3.amazonaws.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s3-region">Region</Label>
                      <Input
                        id="s3-region"
                        value={createForm.s3Config.region}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          s3Config: { ...prev.s3Config, region: e.target.value }
                        }))}
                        placeholder="us-east-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="s3-bucket">Bucket Name</Label>
                      <Input
                        id="s3-bucket"
                        value={createForm.s3Config.bucket}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          s3Config: { ...prev.s3Config, bucket: e.target.value }
                        }))}
                        placeholder="my-whatsapp-media"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s3-access-key">Access Key</Label>
                      <Input
                        id="s3-access-key"
                        value={createForm.s3Config.accessKey}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          s3Config: { ...prev.s3Config, accessKey: e.target.value }
                        }))}
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="s3-secret-key">Secret Key</Label>
                      <Input
                        id="s3-secret-key"
                        type="password"
                        value={createForm.s3Config.secretKey}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          s3Config: { ...prev.s3Config, secretKey: e.target.value }
                        }))}
                        placeholder="wJalrXUtnFEMI/K7MDENG..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s3-public-url">Public URL (Optional)</Label>
                      <Input
                        id="s3-public-url"
                        value={createForm.s3Config.publicURL}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          s3Config: { ...prev.s3Config, publicURL: e.target.value }
                        }))}
                        placeholder="https://cdn.example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="s3-media-delivery">Media Delivery</Label>
                      <Select
                        value={createForm.s3Config.mediaDelivery}
                        onValueChange={(value) => setCreateForm(prev => ({
                          ...prev,
                          s3Config: { ...prev.s3Config, mediaDelivery: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base64">Base64</SelectItem>
                          <SelectItem value="both">Both (Base64 + S3 URL)</SelectItem>
                          <SelectItem value="s3">S3 URL Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s3-retention-days">Retention Days</Label>
                      <Input
                        id="s3-retention-days"
                        type="number"
                        value={createForm.s3Config.retentionDays}
                        onChange={(e) => setCreateForm(prev => ({
                          ...prev,
                          s3Config: { ...prev.s3Config, retentionDays: parseInt(e.target.value) || 30 }
                        }))}
                        min="1"
                        max="365"
                        placeholder="30"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="s3-path-style"
                          checked={createForm.s3Config.pathStyle}
                          onCheckedChange={(checked) => setCreateForm(prev => ({
                            ...prev,
                            s3Config: { ...prev.s3Config, pathStyle: !!checked }
                          }))}
                        />
                        <Label htmlFor="s3-path-style" className="text-sm">
                          Use Path Style URLs
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={handleCloseCreateDialog}
              className="h-8 sm:h-9 text-xs sm:text-sm order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSession} 
              disabled={isCreating}
              className="h-8 sm:h-9 text-xs sm:text-sm order-1 sm:order-2"
            >
              {isCreating ? 'Creating...' : 'Create Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Edit Session Dialog */}
      <Dialog open={showAdvancedEditDialog} onOpenChange={setShowAdvancedEditDialog}>
        <DialogContent className="w-[95%] max-w-[350px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-sm sm:text-base md:text-lg">Advanced Settings</DialogTitle>
            <DialogDescription className="text-[10px] sm:text-xs md:text-sm">
              Configure webhook, proxy, and S3 settings for &ldquo;{sessionToEdit?.name || sessionToEdit?.sessionName}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 md:space-y-6 py-2 sm:py-3 md:py-4">
            {/* Webhook Configuration */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm md:text-base font-medium">Webhook Configuration</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteWebhook}
                  disabled={isDeletingWebhook || !editFormData.webhook.url}
                  className="text-red-600 hover:text-red-700 h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {isDeletingWebhook ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="webhook-url" className="text-xs sm:text-sm">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    value={editFormData.webhook.url}
                    onChange={(e) => setEditFormData(prev => ({ 
                      ...prev, 
                      webhook: { ...prev.webhook, url: e.target.value }
                    }))}
                    placeholder="https://example.com/webhook"
                    className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Webhook Events</Label>
                  <div className="border rounded-md p-2 sm:p-3 max-h-32 sm:max-h-40 overflow-y-auto">
                    {isLoadingEvents ? (
                      <div className="text-center text-muted-foreground text-xs sm:text-sm">Loading events...</div>
                    ) : availableWebhookEvents.length > 0 ? (
                      <div className="space-y-1 sm:space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="all-events"
                            checked={editFormData.webhook.allEvents}
                            onCheckedChange={(checked) => {
                              setEditFormData(prev => ({ 
                                ...prev, 
                                webhook: { 
                                  ...prev.webhook, 
                                  allEvents: !!checked,
                                  events: checked ? [] : prev.webhook.events
                                }
                              }));
                            }}
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                          <Label htmlFor="all-events" className="font-medium text-xs sm:text-sm">All Events</Label>
                        </div>
                        {!editFormData.webhook.allEvents && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mt-2 sm:mt-3">
                            {availableWebhookEvents.filter(event => event !== 'All').map((event) => (
                              <div key={event} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`event-${event}`}
                                  checked={editFormData.webhook.events.includes(event)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setEditFormData(prev => ({
                                        ...prev,
                                        webhook: {
                                          ...prev.webhook,
                                          events: [...prev.webhook.events, event]
                                        }
                                      }));
                                    } else {
                                      setEditFormData(prev => ({
                                        ...prev,
                                        webhook: {
                                          ...prev.webhook,
                                          events: prev.webhook.events.filter(e => e !== event)
                                        }
                                      }));
                                    }
                                  }}
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                />
                                <Label htmlFor={`event-${event}`} className="text-[10px] sm:text-xs md:text-sm">{event}</Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground text-xs sm:text-sm">No events available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Proxy Configuration */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm md:text-base font-medium">Proxy Configuration</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteProxy}
                  disabled={isDeletingProxy || !editFormData.proxy.enabled}
                  className="text-red-600 hover:text-red-700 h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {isDeletingProxy ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="proxy-enabled"
                    checked={editFormData.proxy.enabled}
                    onCheckedChange={(checked) => 
                      setEditFormData(prev => ({ 
                        ...prev, 
                        proxy: { ...prev.proxy, enabled: !!checked }
                      }))
                    }
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <Label htmlFor="proxy-enabled" className="text-xs sm:text-sm">Enable Proxy</Label>
                </div>
                {editFormData.proxy.enabled && (
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="proxy-url" className="text-xs sm:text-sm">Proxy URL</Label>
                    <Input
                      id="proxy-url"
                      value={editFormData.proxy.url}
                      onChange={(e) => setEditFormData(prev => ({ 
                        ...prev, 
                        proxy: { ...prev.proxy, url: e.target.value }
                      }))}
                      placeholder="socks5://user:pass@host:port"
                      className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Note: Enabling proxy will disconnect the session if currently connected.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* S3 Configuration */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm md:text-base font-medium">S3 Storage Configuration</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteS3}
                  disabled={!editFormData.s3.enabled}
                  className="text-red-600 hover:text-red-700 h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Delete
                </Button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="s3-enabled"
                    checked={editFormData.s3.enabled}
                    onCheckedChange={(checked) => 
                      setEditFormData(prev => ({ 
                        ...prev, 
                        s3: { ...prev.s3, enabled: !!checked }
                      }))
                    }
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <Label htmlFor="s3-enabled" className="text-xs sm:text-sm">Enable S3 Storage</Label>
                </div>
                {editFormData.s3.enabled && (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="s3-endpoint" className="text-xs sm:text-sm">Endpoint</Label>
                        <Input
                          id="s3-endpoint"
                          value={editFormData.s3.endpoint}
                          onChange={(e) => setEditFormData(prev => ({ 
                            ...prev, 
                            s3: { ...prev.s3, endpoint: e.target.value }
                          }))}
                          placeholder="https://s3.amazonaws.com"
                          className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="s3-region" className="text-xs sm:text-sm">Region</Label>
                        <Input
                          id="s3-region"
                          value={editFormData.s3.region}
                          onChange={(e) => setEditFormData(prev => ({ 
                            ...prev, 
                            s3: { ...prev.s3, region: e.target.value }
                          }))}
                          placeholder="us-east-1"
                          className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="s3-bucket" className="text-xs sm:text-sm">Bucket</Label>
                        <Input
                          id="s3-bucket"
                          value={editFormData.s3.bucket}
                          onChange={(e) => setEditFormData(prev => ({ 
                            ...prev, 
                            s3: { ...prev.s3, bucket: e.target.value }
                          }))}
                          placeholder="my-whatsapp-media"
                          className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="s3-access-key" className="text-xs sm:text-sm">Access Key</Label>
                        <Input
                          id="s3-access-key"
                          value={editFormData.s3.accessKeyId}
                          onChange={(e) => setEditFormData(prev => ({ 
                            ...prev, 
                            s3: { ...prev.s3, accessKeyId: e.target.value }
                          }))}
                          placeholder="AKIAIOSFODNN7EXAMPLE"
                          className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="s3-secret-key" className="text-xs sm:text-sm">Secret Key</Label>
                        <Input
                          id="s3-secret-key"
                          type="password"
                          value={editFormData.s3.secretAccessKey}
                          onChange={(e) => setEditFormData(prev => ({ 
                            ...prev, 
                            s3: { ...prev.s3, secretAccessKey: e.target.value }
                          }))}
                          placeholder="Enter secret key"
                          className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="s3-public-url" className="text-xs sm:text-sm">Public URL</Label>
                        <Input
                          id="s3-public-url"
                          value={editFormData.s3.publicUrl}
                          onChange={(e) => setEditFormData(prev => ({ 
                            ...prev, 
                            s3: { ...prev.s3, publicUrl: e.target.value }
                          }))}
                          placeholder="https://cdn.example.com"
                          className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="s3-media-delivery" className="text-xs sm:text-sm">Media Delivery</Label>
                        <Select 
                          value={editFormData.s3.mediaDelivery} 
                          onValueChange={(value) => 
                            setEditFormData(prev => ({ 
                              ...prev, 
                              s3: { ...prev.s3, mediaDelivery: value }
                            }))
                          }
                        >
                          <SelectTrigger className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="base64">Base64</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="s3-retention-days" className="text-xs sm:text-sm">Retention Days</Label>
                        <Input
                          id="s3-retention-days"
                          type="number"
                          value={editFormData.s3.retentionDays}
                          onChange={(e) => setEditFormData(prev => ({ 
                            ...prev, 
                            s3: { ...prev.s3, retentionDays: parseInt(e.target.value) || 30 }
                          }))}
                          placeholder="30"
                          min="1"
                          max="365"
                          className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <Label className="flex items-center space-x-2 text-xs sm:text-sm">
                          <Checkbox
                            checked={editFormData.s3.pathStyle}
                            onCheckedChange={(checked) => 
                              setEditFormData(prev => ({ 
                                ...prev, 
                                s3: { ...prev.s3, pathStyle: !!checked }
                              }))
                            }
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                          <span>Path Style</span>
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-4">
            <Button 
              variant="outline" 
              onClick={handleCloseAdvancedEditDialog}
              className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAdvancedChanges} 
              disabled={isSavingAdvanced || !hasAdvancedFormChanges}
              className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm order-1 sm:order-2"
            >
              {isSavingAdvanced ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="w-[95%] max-w-[350px] sm:max-w-[500px] md:max-w-[600px] max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-sm sm:text-base md:text-lg">Session Details</DialogTitle>
            <DialogDescription className="text-[10px] sm:text-xs md:text-sm">
              Detailed information about the WhatsApp session.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-3 sm:space-y-4 md:space-y-6 py-2 sm:py-3 md:py-4">
              {/* Basic Information */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold border-b pb-1 sm:pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Session ID</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground font-mono break-all bg-muted p-1 sm:p-2 rounded mt-1">
                      {selectedSession.sessionId}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Session Name</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-1 sm:p-2 rounded mt-1">
                      {selectedSession.name || selectedSession.sessionName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">WhatsApp Number</Label>
                    {selectedSession.jid ? (
                      <p className="text-xs sm:text-sm text-muted-foreground font-mono bg-muted p-1 sm:p-2 rounded mt-1">
                        {selectedSession.jid.split(':')[0]}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-1 sm:p-2 rounded mt-1">
                        Not connected
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Token</Label>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1">
                      <p className="text-xs sm:text-sm text-muted-foreground font-mono bg-muted p-1 sm:p-2 rounded flex-1">
                        {selectedSession.token ? `${selectedSession.token.substring(0, 20)}...` : selectedSession.sessionId}
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const tokenToCopy = selectedSession.token || selectedSession.sessionId;
                                navigator.clipboard.writeText(tokenToCopy);
                                setIsCopied(true);
                                setTimeout(() => setIsCopied(false), 2000);
                              }}
                              className="h-6 sm:h-7 md:h-8 px-1 sm:px-2"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{isCopied ? 'Copied!' : 'Copy token'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Connected</Label>
                    <div className="mt-1">
                      {selectedSession.connected ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-[10px] sm:text-xs">
                          <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 text-[10px] sm:text-xs">
                          <XCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          Disconnected
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Logged In</Label>
                    <div className="mt-1">
                      {selectedSession.loggedIn ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-[10px] sm:text-xs">
                          <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          Logged In
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 text-[10px] sm:text-xs">
                          <XCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                          Not Logged In
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Webhook Configuration */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold border-b pb-1 sm:pb-2">Webhook Configuration</h3>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Webhook URL</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all bg-muted p-1 sm:p-2 rounded mt-1">
                    {selectedSession.webhook || 'Not configured'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Webhook Events</Label>
                  <div className="mt-1 sm:mt-2 p-2 sm:p-3 bg-muted rounded">
                    {selectedSession.events && selectedSession.events !== 'All' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                        {selectedSession.events.split(',').map((event, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-green-600" />
                            <span className="text-[10px] sm:text-xs md:text-sm">{event.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-green-600" />
                        <span className="text-[10px] sm:text-xs md:text-sm font-medium">All Events</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Proxy Configuration */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold border-b pb-1 sm:pb-2">Proxy Configuration</h3>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Proxy Enabled</Label>
                  <div className="mt-1">
                    {selectedSession.proxyEnabled ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-[10px] sm:text-xs">
                        <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-[10px] sm:text-xs">
                        <XCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Show proxy details only if enabled */}
                {selectedSession.proxyEnabled && selectedSession.proxyUrl && (
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Proxy URL</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground font-mono break-all bg-muted p-1 sm:p-2 rounded mt-1">
                      {selectedSession.proxyUrl}
                    </p>
                  </div>
                )}
              </div>

              {/* S3 Configuration */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold border-b pb-1 sm:pb-2">S3 Configuration</h3>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">S3 Enabled</Label>
                  <div className="mt-1">
                    {selectedSession.s3Enabled ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 text-[10px] sm:text-xs">
                        <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-[10px] sm:text-xs">
                        <XCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Show S3 details only if enabled */}
                {selectedSession.s3Enabled && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">Media Delivery</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-1 sm:p-2 rounded mt-1">
                          {selectedSession.s3MediaDelivery || 'base64'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">Retention Days</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-1 sm:p-2 rounded mt-1">
                          {selectedSession.s3RetentionDays || 30} days
                        </p>
                      </div>
                    </div>

                    {selectedSession.s3Endpoint && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <Label className="text-xs sm:text-sm font-medium">S3 Endpoint</Label>
                          <p className="text-xs sm:text-sm text-muted-foreground break-all bg-muted p-1 sm:p-2 rounded mt-1">
                            {selectedSession.s3Endpoint}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm font-medium">Region</Label>
                          <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-1 sm:p-2 rounded mt-1">
                            {selectedSession.s3Region || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedSession.s3Bucket && (
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">Bucket</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-1 sm:p-2 rounded mt-1">
                          {selectedSession.s3Bucket}
                        </p>
                      </div>
                    )}

                    {selectedSession.s3PublicUrl && (
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">Public URL</Label>
                        <p className="text-xs sm:text-sm text-muted-foreground break-all bg-muted p-1 sm:p-2 rounded mt-1">
                          {selectedSession.s3PublicUrl}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Created and Updated Date */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Created Date</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-1 sm:p-2 rounded mt-1">
                      {new Date(selectedSession.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm font-medium">Updated At</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-1 sm:p-2 rounded mt-1">
                      {new Date(selectedSession.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the WhatsApp session
              {sessionToDelete && ` "${sessionToDelete.name || sessionToDelete.sessionName}"`} from your WhatsApp Go service and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? 'Deleting...' : 'Delete Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect Session Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={handleCloseConnectDialog}>
        <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              Connect WhatsApp Session
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Connect &ldquo;{sessionToControl?.name || sessionToControl?.sessionName}&rdquo; to WhatsApp server. After connection, QR code will be available for authentication.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 sm:gap-3 md:gap-4 py-2 sm:py-4">
            {/* Current Session Info */}
            <div className="bg-muted/50 p-2 sm:p-3 md:p-4 rounded-lg">
              <Label className="text-xs sm:text-sm font-medium">Session Configuration</Label>
              <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground">Webhook Events:</span>
                  <span className="ml-1 sm:ml-2 font-medium truncate">
                    {sessionToControl?.events || 'All'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Subscribe Events:</span>
                  <span className="ml-1 sm:ml-2 font-medium truncate">
                    {connectForm.Subscribe.length === 0 ? 'All (default)' : connectForm.Subscribe.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Connection Options */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm">Connection Options</Label>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <Checkbox
                  id="immediate-connect"
                  checked={connectForm.Immediate}
                  onCheckedChange={(checked) => setConnectForm(prev => ({ ...prev, Immediate: !!checked }))}
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
                <Label htmlFor="immediate-connect" className="text-xs sm:text-sm">Immediate Connection</Label>
              </div>

              <div className="text-[10px] sm:text-xs text-muted-foreground space-y-0.5 sm:space-y-1">
                <p>• Subscribe events are automatically configured from your webhook settings</p>
                <p>• QR code will be available immediately after connection</p>
                <p>• Connection consumes server resources until disconnected</p>
              </div>
            </div>

            {/* Next Steps Preview */}
            <div className="bg-blue-50 border border-blue-200 p-2 sm:p-3 rounded-lg">
              <div className="flex items-center gap-1 sm:gap-2 text-blue-800 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
                <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
                Next: QR Code Authentication
              </div>
              <p className="text-blue-700 text-[10px] sm:text-xs">
                After connecting, scan the QR code with WhatsApp to complete authentication
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
            <Button 
              variant="outline" 
              onClick={handleCloseConnectDialog}
              className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmConnect}
              disabled={isConnecting}
              className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="truncate">Connecting...</span>
                </>
              ) : (
                <>
                  <Zap className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Connect & Show QR</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Monitor Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={handleCloseStatusDialog}>
        <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl max-h-[80vh] sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">Session Status Monitor</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Real-time status for &ldquo;{sessionToControl?.name || sessionToControl?.sessionName}&rdquo; - Updates every 3 seconds
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 sm:gap-3 md:gap-4 py-2 sm:py-4">
            {isGettingStatus && !sessionStatus && (
              <div className="text-center py-4 sm:py-6 md:py-8">
                <RefreshCw className="mx-auto h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Loading status...</p>
              </div>
            )}

            {sessionStatus && (
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {/* Status Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Connection Status</Label>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {sessionStatus.connected ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1">
                          <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1">
                          <XCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          Disconnected
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">Login Status</Label>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {sessionStatus.loggedIn ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1">
                          <CheckCircle className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          Logged In
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1">
                          <QrCode className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          Login Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Number */}
                {sessionStatus.jid && (
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">WhatsApp Number</Label>
                    <p className="text-xs sm:text-sm font-mono bg-muted p-1 sm:p-2 rounded truncate">
                      {sessionStatus.jid}
                    </p>
                  </div>
                )}

                {/* QR Code Display */}
                {sessionStatus.qrcode && !sessionStatus.loggedIn && (
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-medium">QR Code - Scan with WhatsApp</Label>
                    <div className="flex justify-center p-2 sm:p-3 md:p-4 bg-white rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sessionStatus.qrcode}
                        alt="WhatsApp QR Code"
                        className="max-w-[150px] max-h-[150px] sm:max-w-[180px] sm:max-h-[180px] md:max-w-[200px] md:max-h-[200px]"
                      />
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      QR code updates automatically. Scan with WhatsApp to login.
                    </p>
                  </div>
                )}

                {/* Success Message */}
                {sessionStatus.loggedIn && (
                  <div className="bg-green-50 border border-green-200 p-2 sm:p-3 md:p-4 rounded-lg text-center">
                    <CheckCircle className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-1 sm:mb-2" />
                    <p className="text-green-800 font-medium text-xs sm:text-sm">WhatsApp Connected Successfully!</p>
                    <p className="text-green-600 text-[10px] sm:text-xs">Session is ready to use.</p>
                  </div>
                )}

                {/* Connection Required */}
                {!sessionStatus.connected && (
                  <div className="bg-amber-50 border border-amber-200 p-2 sm:p-3 md:p-4 rounded-lg text-center">
                    <XCircle className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-amber-600 mb-1 sm:mb-2" />
                    <p className="text-amber-800 font-medium text-xs sm:text-sm">Session Disconnected</p>
                    <p className="text-amber-600 text-[10px] sm:text-xs">Connect the session first to get QR code.</p>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-3 md:pt-4 border-t">
                  <div className="space-y-0.5 sm:space-y-1">
                    <Label className="text-[10px] sm:text-xs text-muted-foreground">Events</Label>
                    <p className="text-xs sm:text-sm truncate">{sessionStatus.events}</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <Label className="text-[10px] sm:text-xs text-muted-foreground">Session ID</Label>
                    <p className="text-xs sm:text-sm font-mono truncate">{sessionStatus.id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 sm:pt-4">
            <Button 
              variant="outline" 
              onClick={handleCloseStatusDialog}
              className="w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              Close Monitor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={handleCloseQrDialog}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
              <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
              WhatsApp QR Authentication
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Scan QR code or use phone pairing to authenticate &ldquo;{sessionToControl?.name || sessionToControl?.sessionName}&rdquo;
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:gap-4 md:gap-6 py-2 sm:py-4">
            {/* Session Status */}
            {sessionStatus && (
              <div className="bg-muted/50 p-2 sm:p-3 md:p-4 rounded-lg">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <Label className="text-xs sm:text-sm font-medium">Session Status</Label>
                  {isGettingStatus && (
                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground">Connected:</span>
                    <span className={`ml-1 sm:ml-2 font-medium ${sessionStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                      {sessionStatus.connected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Logged In:</span>
                    <span className={`ml-1 sm:ml-2 font-medium ${sessionStatus.loggedIn ? 'text-green-600' : 'text-orange-600'}`}>
                      {sessionStatus.loggedIn ? 'Yes' : 'Pending'}
                    </span>
                  </div>
                </div>
                {sessionStatus.jid && sessionStatus.loggedIn && (
                  <div className="mt-1 sm:mt-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded">
                    <div className="text-xs sm:text-sm text-green-800">
                      <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-medium">WhatsApp Connected Successfully!</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-green-700">
                        <span className="font-medium">Phone Number:</span> +{sessionStatus.jid.split('@')[0].split(':')[0]}
                      </div>
                      <div className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">
                        You can close this dialog. The session is ready to use.
                      </div>
                    </div>
                  </div>
                )}
                {sessionStatus.loggedIn && !sessionStatus.jid && (
                  <div className="mt-1 sm:mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs sm:text-sm text-green-800">
                    ✅ WhatsApp authentication successful! You can close this dialog.
                  </div>
                )}
              </div>
            )}

            {/* QR Code Section - Hide when already logged in */}
            {!sessionStatus?.loggedIn && (
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs sm:text-sm font-medium">QR Code Authentication</Label>
                  <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <RefreshCw className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span className="hidden sm:inline">QR: every 2s, Status: every 1s</span>
                    <span className="sm:hidden">Auto-refresh</span>
                  </div>
                </div>

                {qrCode ? (
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex justify-center p-3 sm:p-4 md:p-6 bg-white rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCode}
                        alt="WhatsApp QR Code"
                        className="max-w-[200px] max-h-[200px] sm:max-w-[240px] sm:max-h-[240px] md:max-w-[280px] md:max-h-[280px]"
                      />
                    </div>
                    <div className="text-center space-y-1 sm:space-y-2">
                      <p className="text-xs sm:text-sm font-medium">📱 Scan with WhatsApp</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Open WhatsApp → Settings → Linked Devices → Link a Device
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 md:py-12 text-muted-foreground border rounded-lg">
                    {isGettingQR ? (
                      <>
                        <RefreshCw className="mx-auto h-6 w-6 sm:h-8 sm:w-8 animate-spin mb-1 sm:mb-2" />
                        <p className="text-xs sm:text-sm">Loading QR code...</p>
                      </>
                    ) : (
                      <>
                        <QrCode className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground/50 mb-1 sm:mb-2" />
                        <p className="text-xs sm:text-sm">QR code not available</p>
                        <p className="text-[10px] sm:text-xs">Session might not be ready for authentication</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Alternative: Phone Pairing - Hide when already logged in */}
            {!sessionStatus?.loggedIn && (
              <div className="border-t pt-2 sm:pt-3 md:pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4">
                  <Label className="text-xs sm:text-sm font-medium">Alternative: Phone Pairing</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleCloseQrDialog();
                      if (sessionToControl) {
                        handlePairPhone(sessionToControl);
                      }
                    }}
                    className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  >
                    <Phone className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Use Phone Pairing
                  </Button>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  If QR scanning doesn&rsquo;t work, you can use phone number pairing instead
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
            <Button 
              variant="outline" 
              onClick={handleCloseQrDialog}
              className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              Close
            </Button>
            {sessionStatus?.loggedIn && (
              <Button 
                onClick={() => {
                  handleCloseQrDialog();
                  fetchSessions();
                }}
                className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <CheckCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pair Phone Dialog */}
      <Dialog open={showPairPhoneDialog} onOpenChange={handleClosePairPhoneDialog}>
        <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-lg">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">Pair Phone Number</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Link WhatsApp account for &ldquo;{sessionToControl?.name || sessionToControl?.sessionName}&rdquo; using phone number
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 sm:gap-3 md:gap-4 py-2 sm:py-4">
            {/* Show form only if not yet connected or no linking code generated */}
            {!sessionStatus?.loggedIn && (
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="phone-number" className="text-xs sm:text-sm">Phone Number</Label>
                <Input
                  id="phone-number"
                  value={pairPhoneForm.Phone}
                  onChange={(e) => setPairPhoneForm(prev => ({ ...prev, Phone: e.target.value }))}
                  placeholder="628123456789"
                  maxLength={15}
                  className="text-xs sm:text-sm"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Enter phone number with country code (e.g., 62 for Indonesia). Do not include leading zero or + symbol.
                </p>
              </div>
            )}

            {/* Show linking code only if generated but not yet connected */}
            {linkingCode && !sessionStatus?.loggedIn && (
              <div className="space-y-2 sm:space-y-3 bg-green-50 border border-green-200 p-2 sm:p-3 md:p-4 rounded-lg">
                <Label className="text-xs sm:text-sm font-medium text-green-800">Linking Code Generated</Label>
                <div className="text-center">
                  <p className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-green-800 tracking-wider">
                    {linkingCode}
                  </p>
                </div>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-green-700">
                  <p className="font-medium">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
                    <li>Open WhatsApp on your phone</li>
                    <li>Go to Settings → Linked Devices</li>
                    <li>Tap &ldquo;Link a Device&rdquo;</li>
                    <li>Tap &ldquo;Link with Phone Number Instead&rdquo;</li>
                    <li>Enter the linking code above</li>
                  </ol>
                </div>
                <p className="text-[10px] sm:text-xs text-green-600 italic">
                  Note: This code can only be used once. Generate a new one if it fails.
                </p>
              </div>
            )}

            {/* Status monitoring for phone pairing */}
            {isPhonePairingMode && linkingCode && sessionStatus && (
              <div className="bg-muted/50 p-2 sm:p-3 md:p-4 rounded-lg">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <Label className="text-xs sm:text-sm font-medium">Connection Status</Label>
                  {isGettingStatus && (
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground">Connected:</span>
                    <span className={`ml-1 sm:ml-2 font-medium ${sessionStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                      {sessionStatus.connected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Logged In:</span>
                    <span className={`ml-1 sm:ml-2 font-medium ${sessionStatus.loggedIn ? 'text-green-600' : 'text-orange-600'}`}>
                      {sessionStatus.loggedIn ? 'Yes' : 'Waiting...'}
                    </span>
                  </div>
                </div>
                
                {sessionStatus.loggedIn && sessionStatus.jid && (
                  <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded">
                    <div className="text-xs sm:text-sm text-green-800">
                      <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-medium">Phone Pairing Successful!</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-green-700">
                        <span className="font-medium">Connected Phone:</span> +{sessionStatus.jid.split('@')[0].split(':')[0]}
                      </div>
                      <div className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">
                        Your WhatsApp device is now connected and ready to use.
                      </div>
                    </div>
                  </div>
                )}
                
                {!sessionStatus.loggedIn && (
                  <div className="mt-1 sm:mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs sm:text-sm text-blue-800">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <RefreshCw className="h-2 w-2 sm:h-3 sm:w-3 animate-spin" />
                      <span className="text-[10px] sm:text-xs">Waiting for phone pairing... Please enter the linking code on your phone.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
            <Button 
              variant="outline" 
              onClick={handleClosePairPhoneDialog}
              className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              Close
            </Button>
            {sessionStatus?.loggedIn ? (
              <Button 
                onClick={() => {
                  handleClosePairPhoneDialog();
                  fetchSessions();
                }}
                className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <CheckCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Done
              </Button>
            ) : (
              <Button
                onClick={handleConfirmPairPhone}
                disabled={isPairingPhone || !pairPhoneForm.Phone}
                className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                {isPairingPhone ? 'Generating...' : 'Generate Code'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Token Confirmation Dialog */}
      {showTokenDialog && selectedSession && (
        <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Session Token Access
              </DialogTitle>
              <DialogDescription>
                Session: {selectedSession.name || selectedSession.sessionName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <Lock className="h-4 w-4" />
                  <p className="text-sm font-medium">Security Warning</p>
                </div>
                <p className="text-sm text-amber-700">
                  This token provides full access to your WhatsApp session. Keep it secure and never share it with unauthorized users.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Session Token:</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono break-all bg-background p-2 rounded border flex-1">
                    {selectedSession.token || selectedSession.sessionId}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedSession.token || selectedSession.sessionId);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
                    }}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• <strong>Keep this token secure</strong> and do not share it with others</p>
                <p>• This token provides access to your WhatsApp session API</p>
                <p>• You can regenerate the token if needed for security</p>
                <p>• Store it safely and use environment variables in production</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTokenDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Advanced Edit Dialog - Webhook, Proxy, S3 Configuration */}
      <Dialog open={showAdvancedEditDialog} onOpenChange={handleCloseAdvancedEditDialog}>
        <DialogContent className="w-[95vw] max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              Advanced Settings
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Configure webhook, proxy, and S3 storage for session: {sessionToEdit?.sessionName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 sm:gap-4 md:gap-6 py-2 sm:py-4">
            {/* Webhook Configuration */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4 border rounded-lg p-2 sm:p-3 md:p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm sm:text-base md:text-lg font-semibold">Webhook Configuration</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteWebhook}
                  disabled={isDeletingWebhook || !editFormData.webhook.url}
                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{isDeletingWebhook ? 'Deleting...' : 'Delete Webhook'}</span>
                  <span className="sm:hidden">{isDeletingWebhook ? 'Deleting...' : 'Delete'}</span>
                </Button>
              </div>
              
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="webhook-url" className="text-xs sm:text-sm">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    value={editFormData.webhook.url}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      webhook: { ...prev.webhook, url: e.target.value }
                    }))}
                    placeholder="https://your-domain.com/webhook"
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-xs sm:text-sm">Webhook Events</Label>
                  {isLoadingEvents ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="text-xs sm:text-sm text-muted-foreground">Loading events...</span>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 max-h-32 sm:max-h-40 md:max-h-48 overflow-y-auto">
                      {/* All Events Toggle */}
                      <div className="flex items-center space-x-1 sm:space-x-2 pb-1 sm:pb-2 border-b">
                        <Checkbox
                          id="all-events-edit"
                          checked={editFormData.webhook.allEvents}
                          onCheckedChange={(checked) => setEditFormData(prev => ({
                            ...prev,
                            webhook: {
                              ...prev.webhook,
                              allEvents: !!checked,
                              events: checked ? [] : prev.webhook.events
                            }
                          }))}
                          className="h-3 w-3 sm:h-4 sm:w-4"
                        />
                        <Label htmlFor="all-events-edit" className="text-xs sm:text-sm font-medium">
                          All Events {editFormData.webhook.allEvents && availableWebhookEvents.length > 0 && `(${availableWebhookEvents.length} events)`}
                        </Label>
                      </div>

                      {/* Individual Events (shown only when not "All") */}
                      {!editFormData.webhook.allEvents && availableWebhookEvents.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                          {availableWebhookEvents.map((event) => {
                            const isMessageEvent = event === "Message";
                            const isChecked = editFormData.webhook.events.includes(event) || isMessageEvent; // Message is always checked
                            
                            return (
                              <div key={event} className="flex items-center space-x-1 sm:space-x-2">
                                <Checkbox
                                  id={`edit-event-${event}`}
                                  checked={isChecked}
                                  disabled={isMessageEvent} // Disable Message checkbox
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                  onCheckedChange={(checked) => {
                                    // Prevent unchecking "Message" event as it's mandatory
                                    if (event === 'Message' && !checked) {
                                      return;
                                    }
                                    
                                    if (checked) {
                                      setEditFormData(prev => ({
                                        ...prev,
                                        webhook: {
                                          ...prev.webhook,
                                          events: [...prev.webhook.events, event]
                                        }
                                      }));
                                    } else {
                                      setEditFormData(prev => ({
                                        ...prev,
                                        webhook: {
                                          ...prev.webhook,
                                          events: prev.webhook.events.filter(e => e !== event)
                                        }
                                      }));
                                    }
                                  }}
                                />
                                <Label 
                                  htmlFor={`edit-event-${event}`} 
                                  className={`text-xs ${isMessageEvent ? 'font-medium text-orange-600' : ''}`}
                                >
                                  {event} {isMessageEvent && '(Required)'}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Selected count when not all */}
                      {!editFormData.webhook.allEvents && editFormData.webhook.events.length > 0 && (
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Selected: {Math.max(editFormData.webhook.events.length, 1)} of {availableWebhookEvents.length} events
                          <span className="text-orange-600 ml-2">(Message is required)</span>
                        </div>
                      )}

                      {/* Fallback to hardcoded events if API events not available */}
                      {!editFormData.webhook.allEvents && availableWebhookEvents.length === 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                          {WEBHOOK_EVENTS.map((event) => {
                            const isMessageEvent = event === "Message";
                            const isChecked = editFormData.webhook.events.includes(event) || isMessageEvent; // Message is always checked
                            
                            return (
                              <div key={event} className="flex items-center space-x-1 sm:space-x-2">
                                <Checkbox
                                  id={`fallback-edit-event-${event}`}
                                  checked={isChecked}
                                  disabled={isMessageEvent} // Disable Message checkbox
                                  className="h-3 w-3 sm:h-4 sm:w-4"
                                  onCheckedChange={(checked) => {
                                    // Prevent unchecking "Message" event as it's mandatory
                                    if (event === 'Message' && !checked) {
                                      return;
                                    }
                                    
                                    if (checked) {
                                      setEditFormData(prev => ({
                                        ...prev,
                                        webhook: {
                                          ...prev.webhook,
                                          events: [...prev.webhook.events, event]
                                        }
                                      }));
                                    } else {
                                      setEditFormData(prev => ({
                                        ...prev,
                                        webhook: {
                                          ...prev.webhook,
                                          events: prev.webhook.events.filter(e => e !== event)
                                        }
                                      }));
                                    }
                                  }}
                                />
                                <Label 
                                  htmlFor={`fallback-edit-event-${event}`} 
                                  className={`text-xs ${isMessageEvent ? 'font-medium text-orange-600' : ''}`}
                                >
                                  {event} {isMessageEvent && '(Required)'}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Proxy Configuration */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4 border rounded-lg p-2 sm:p-3 md:p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm sm:text-base md:text-lg font-semibold">Proxy Configuration</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteProxy}
                  disabled={isDeletingProxy || !editFormData.proxy.enabled}
                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{isDeletingProxy ? 'Deleting...' : 'Delete Proxy'}</span>
                  <span className="sm:hidden">{isDeletingProxy ? 'Deleting...' : 'Delete'}</span>
                </Button>
              </div>
              
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Checkbox
                    id="proxy-enabled-edit"
                    checked={editFormData.proxy.enabled}
                    onCheckedChange={(checked) => setEditFormData(prev => ({
                      ...prev,
                      proxy: { ...prev.proxy, enabled: !!checked }
                    }))}
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <Label htmlFor="proxy-enabled-edit" className="text-xs sm:text-sm font-medium">
                    Enable Proxy
                  </Label>
                </div>

                {editFormData.proxy.enabled && (
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="proxy-url-edit" className="text-xs sm:text-sm">Proxy URL</Label>
                    <Input
                      id="proxy-url-edit"
                      value={editFormData.proxy.url}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        proxy: { ...prev.proxy, url: e.target.value }
                      }))}
                      placeholder="socks5://user:pass@host:port"
                      className="text-xs sm:text-sm"
                    />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Note: Enabling proxy will disconnect the session. Reconnect after saving.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* S3 Configuration */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4 border rounded-lg p-2 sm:p-3 md:p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm sm:text-base md:text-lg font-semibold">S3 Storage Configuration</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteS3}
                  disabled={!editFormData.s3.enabled}
                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Delete S3 Config</span>
                  <span className="sm:hidden">Delete S3</span>
                </Button>
              </div>
              
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Checkbox
                    id="s3-enabled-edit"
                    checked={editFormData.s3.enabled}
                    onCheckedChange={(checked) => setEditFormData(prev => ({
                      ...prev,
                      s3: { ...prev.s3, enabled: !!checked }
                    }))}
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  />
                  <Label htmlFor="s3-enabled-edit" className="text-xs sm:text-sm font-medium">
                    Enable S3 Storage
                  </Label>
                </div>

                {editFormData.s3.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="s3-endpoint-edit" className="text-xs sm:text-sm">S3 Endpoint</Label>
                      <Input
                        id="s3-endpoint-edit"
                        value={editFormData.s3.endpoint}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          s3: { ...prev.s3, endpoint: e.target.value }
                        }))}
                        placeholder="https://s3.amazonaws.com"
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="s3-region-edit" className="text-xs sm:text-sm">Region</Label>
                      <Input
                        id="s3-region-edit"
                        value={editFormData.s3.region}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          s3: { ...prev.s3, region: e.target.value }
                        }))}
                        placeholder="us-east-1"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="s3-bucket-edit" className="text-xs sm:text-sm">Bucket Name</Label>
                      <Input
                        id="s3-bucket-edit"
                        value={editFormData.s3.bucket}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          s3: { ...prev.s3, bucket: e.target.value }
                        }))}
                        placeholder="my-whatsapp-media"
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="s3-access-key-edit" className="text-xs sm:text-sm">Access Key</Label>
                      <Input
                        id="s3-access-key-edit"
                        value={editFormData.s3.accessKeyId}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          s3: { ...prev.s3, accessKeyId: e.target.value }
                        }))}
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="s3-secret-key-edit" className="text-xs sm:text-sm">Secret Key</Label>
                      <Input
                        id="s3-secret-key-edit"
                        type="password"
                        value={editFormData.s3.secretAccessKey}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          s3: { ...prev.s3, secretAccessKey: e.target.value }
                        }))}
                        placeholder="wJalrXUtnFEMI/K7MDENG..."
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="s3-public-url-edit" className="text-xs sm:text-sm">Public URL (Optional)</Label>
                      <Input
                        id="s3-public-url-edit"
                        value={editFormData.s3.publicUrl}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          s3: { ...prev.s3, publicUrl: e.target.value }
                        }))}
                        placeholder="https://cdn.example.com"
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="s3-media-delivery-edit" className="text-xs sm:text-sm">Media Delivery</Label>
                      <Select
                        value={editFormData.s3.mediaDelivery}
                        onValueChange={(value) => setEditFormData(prev => ({
                          ...prev,
                          s3: { ...prev.s3, mediaDelivery: value }
                        }))}
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base64" className="text-xs sm:text-sm">Base64</SelectItem>
                          <SelectItem value="both" className="text-xs sm:text-sm">Both (Base64 + S3 URL)</SelectItem>
                          <SelectItem value="s3" className="text-xs sm:text-sm">S3 URL Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="s3-retention-edit" className="text-xs sm:text-sm">Retention Days</Label>
                      <Input
                        id="s3-retention-edit"
                        type="number"
                        value={editFormData.s3.retentionDays}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          s3: { ...prev.s3, retentionDays: parseInt(e.target.value) || 30 }
                        }))}
                        min="1"
                        max="365"
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-2 col-span-1 sm:col-span-2">
                      <Checkbox
                        id="s3-path-style-edit"
                        checked={editFormData.s3.pathStyle}
                        onCheckedChange={(checked) => setEditFormData(prev => ({
                          ...prev,
                          s3: { ...prev.s3, pathStyle: !!checked }
                        }))}
                        className="h-3 w-3 sm:h-4 sm:w-4"
                      />
                      <Label htmlFor="s3-path-style-edit" className="text-xs sm:text-sm">
                        Use Path Style URLs
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 pt-2 sm:pt-4">
            <div className="flex-1 w-full sm:w-auto">
              {hasUnsavedChanges && (
                <p className="text-xs sm:text-sm text-amber-600 text-center sm:text-left">
                  You have unsaved changes
                </p>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleCloseAdvancedEditDialog}
                className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAdvancedChanges}
                disabled={isSavingAdvanced || !hasUnsavedChanges}
                className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                {isSavingAdvanced ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </SubscriptionGuard>
  );
}
