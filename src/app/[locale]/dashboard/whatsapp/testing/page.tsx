'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle,
  CheckCircle,
  Send,
  Image as ImageIcon,
  MessageSquare,
  Smartphone,
  Wifi,
  WifiOff,
  Upload,
  Link,
  Loader2,
  Copy,
  Code,
  FileImage,
  Mic,
  FileText,
  Video,
  Smile,
  MapPin,
  Users,
  Layout
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SessionManager } from '@/lib/storage';
import SubscriptionGuard from '@/components/whatsapp/subscription-guard';

// Dynamic import for LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/ui/leaflet-map').then(mod => ({ default: mod.LeafletMap })), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-lg border bg-muted animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground">Loading map...</span>
    </div>
  )
});

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

export default function WhatsAppTestingPage() {
    const t = useTranslations('dashboard.whatsapp.testing');
    
    // State management
    const [sessionsData, setSessionsData] = useState<SessionsData | null>(null);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [selectedMessageType, setSelectedMessageType] = useState<'text' | 'image' | 'audio' | 'document' | 'video' | 'sticker' | 'location' | 'contact' | 'template'>('text');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<any>(null);
    
  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [imageMode, setImageMode] = useState<'base64' | 'url'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [processingImage, setProcessingImage] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedImageCode, setCopiedImageCode] = useState(false);
    const [copiedAudioCode, setCopiedAudioCode] = useState(false);
    const [copiedDocumentCode, setCopiedDocumentCode] = useState(false);
    const [copiedVideoCode, setCopiedVideoCode] = useState(false);
    const [copiedStickerCode, setCopiedStickerCode] = useState(false);
    const [copiedLocationCode, setCopiedLocationCode] = useState(false);
    const [copiedContactCode, setCopiedContactCode] = useState(false);
    const [copiedTemplateCode, setCopiedTemplateCode] = useState(false);  // Audio states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBase64, setAudioBase64] = useState('');
  const [processingAudio, setProcessingAudio] = useState(false);
  
  // Document states
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentBase64, setDocumentBase64] = useState('');
  const [documentFileName, setDocumentFileName] = useState('');
  const [processingDocument, setProcessingDocument] = useState(false);
  
  // Video states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoBase64, setVideoBase64] = useState('');
  const [videoCaption, setVideoCaption] = useState('');
  const [processingVideo, setProcessingVideo] = useState(false);
  
  // Sticker states
  const [stickerFile, setStickerFile] = useState<File | null>(null);
  const [stickerBase64, setStickerBase64] = useState('');
  const [processingSticker, setProcessingSticker] = useState(false);
  
  // Location states
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Contact states
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactVcard, setContactVcard] = useState('');
  
  // Template states
  const [templateContent, setTemplateContent] = useState('');
  const [templateFooter, setTemplateFooter] = useState('');
  const [templateButtons, setTemplateButtons] = useState([{ DisplayText: '', Type: 'quickreply' }]);    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
        setLoading(true);
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
        setLoading(false);
        }
    };

    // Handle location selection from map
    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        setLatitude(lat.toString());
        setLongitude(lng.toString());
    }, []);

    const copyToClipboard = async (text: string, type: 'text' | 'image' | 'audio' | 'document' | 'video' | 'sticker' | 'location' | 'contact' | 'template') => {
        try {
        await navigator.clipboard.writeText(text);
        if (type === 'text') {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } else if (type === 'image') {
            setCopiedImageCode(true);
            setTimeout(() => setCopiedImageCode(false), 2000);
        } else if (type === 'audio') {
            setCopiedAudioCode(true);
            setTimeout(() => setCopiedAudioCode(false), 2000);
        } else if (type === 'document') {
            setCopiedDocumentCode(true);
            setTimeout(() => setCopiedDocumentCode(false), 2000);
        } else if (type === 'video') {
            setCopiedVideoCode(true);
            setTimeout(() => setCopiedVideoCode(false), 2000);
        } else if (type === 'sticker') {
            setCopiedStickerCode(true);
            setTimeout(() => setCopiedStickerCode(false), 2000);
        } else if (type === 'location') {
            setCopiedLocationCode(true);
            setTimeout(() => setCopiedLocationCode(false), 2000);
        } else if (type === 'contact') {
            setCopiedContactCode(true);
            setTimeout(() => setCopiedContactCode(false), 2000);
        } else if (type === 'template') {
            setCopiedTemplateCode(true);
            setTimeout(() => setCopiedTemplateCode(false), 2000);
        }
        } catch (err) {
        console.error('Failed to copy: ', err);
        setError('Failed to copy to clipboard');
        }
    };

  const generateCurlCommand = (type: 'text' | 'image' | 'audio' | 'document' | 'video' | 'sticker' | 'location' | 'contact' | 'template') => {
    if (!selectedSession) return '';
    
    const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_API || 'http://localhost:8070/wa';
    const displayPhone = phoneNumber || '62*******';
    let endpoint = '';
    const body: any = { Phone: displayPhone };

    switch (type) {
      case 'text':
        endpoint = '/chat/send/text';
        body.Body = messageBody || 'Your message here';
        break;
      case 'image':
        endpoint = '/chat/send/image';
        body.Image = imageMode === 'url' ? (imageUrl || 'https://example.com/image.jpg') : (imageBase64 || 'data:image/png;base64,YOUR_BASE64_HERE');
        body.Caption = imageCaption || 'Image';
        break;
      case 'audio':
        endpoint = '/chat/send/audio';
        body.Audio = audioBase64 || 'data:audio/ogg;base64,YOUR_BASE64_HERE';
        break;
      case 'document':
        endpoint = '/chat/send/document';
        body.Document = documentBase64 || 'data:application/octet-stream;base64,YOUR_BASE64_HERE';
        body.FileName = documentFileName || 'doc.pdf';
        break;
      case 'video':
        endpoint = '/chat/send/video';
        body.Video = videoBase64 || 'data:video/mp4;base64,YOUR_BASE64_HERE';
        body.Caption = videoCaption || 'Video';
        break;
      case 'sticker':
        endpoint = '/chat/send/sticker';
        body.Sticker = stickerBase64 || 'data:image/webp;base64,YOUR_BASE64_HERE';
        break;
      case 'location':
        endpoint = '/chat/send/location';
        body.Name = locationName || 'Location';
        body.Latitude = parseFloat(latitude) || 48.858;
        body.Longitude = parseFloat(longitude) || 2.294;
        break;
      case 'contact':
        endpoint = '/chat/send/contact';
        body.Name = contactName || 'John';
        body.Vcard = contactVcard || `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName || 'John Doe'}\nTEL:${contactPhone || '+16175551212'}\nEND:VCARD`;
        break;
      case 'template':
        endpoint = '/chat/send/template';
        body.Content = templateContent || 'Title';
        body.Footer = templateFooter || 'Footer';
        body.Buttons = templateButtons.filter(btn => btn.DisplayText.trim() !== '').length > 0 
          ? templateButtons.filter(btn => btn.DisplayText.trim() !== '') 
          : [{"DisplayText":"Yes","Type":"quickreply"}];
        break;
    }

    const jsonBody = JSON.stringify(body, null, 2);
    
    return `curl -X POST "${baseUrl}/wa${endpoint}" \\
     -H "token: ${selectedSession}" \\
     -H "Content-Type: application/json" \\
     -d '${jsonBody}'`;
  };  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setProcessingImage(true);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImageBase64(base64);
        setProcessingImage(false);
      };
      reader.onerror = () => {
        setProcessingImage(false);
        setError('Failed to process image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setProcessingAudio(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setAudioBase64(base64);
        setProcessingAudio(false);
      };
      reader.onerror = () => {
        setProcessingAudio(false);
        setError('Failed to process audio file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setDocumentFileName(file.name);
      setProcessingDocument(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        // Convert any MIME type to application/octet-stream as required by WhatsApp API
        const base64Data = base64.split(',')[1]; // Get only the base64 data without prefix
        const convertedBase64 = `data:application/octet-stream;base64,${base64Data}`;
        setDocumentBase64(convertedBase64);
        setProcessingDocument(false);
      };
      reader.onerror = () => {
        setProcessingDocument(false);
        setError('Failed to process document file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setProcessingVideo(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setVideoBase64(base64);
        setProcessingVideo(false);
      };
      reader.onerror = () => {
        setProcessingVideo(false);
        setError('Failed to process video file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStickerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStickerFile(file);
      setProcessingSticker(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setStickerBase64(base64);
        setProcessingSticker(false);
      };
      reader.onerror = () => {
        setProcessingSticker(false);
        setError('Failed to process sticker file');
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (type: 'text' | 'image' | 'audio' | 'document' | 'video' | 'sticker' | 'location' | 'contact' | 'template') => {
    if (!selectedSession) {
      setError('Please select a WhatsApp session');
      return;
    }

    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    // Validation for each type
    if (type === 'text' && !messageBody) {
      setError('Message body is required');
      return;
    }

    if (type === 'image') {
      if (imageMode === 'url' && !imageUrl) {
        setError('Image URL is required');
        return;
      }
      if (imageMode === 'base64' && !imageBase64) {
        setError('Please select an image file');
        return;
      }
    }

    if (type === 'audio' && !audioBase64) {
      setError('Please select an audio file');
      return;
    }

    if (type === 'document' && !documentBase64) {
      setError('Please select a document file');
      return;
    }

    if (type === 'video' && !videoBase64) {
      setError('Please select a video file');
      return;
    }

    if (type === 'sticker' && !stickerBase64) {
      setError('Please select a sticker file');
      return;
    }

    if (type === 'location' && (!latitude || !longitude)) {
      setError('Latitude and longitude are required');
      return;
    }

    if (type === 'contact' && (!contactName || !contactPhone)) {
      setError('Contact name and phone are required');
      return;
    }

    if (type === 'template' && !templateContent) {
      setError('Template content is required');
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const selectedSessionData = sessionsData?.sessions.find(s => s.token === selectedSession);
      if (!selectedSessionData) {
        throw new Error('Selected session not found');
      }

      const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_API || 'http://localhost:8070/wa';
      let endpoint = '';
      const requestBody: any = { Phone: phoneNumber };

      switch (type) {
        case 'text':
          endpoint = '/chat/send/text';
          requestBody.Body = messageBody;
          break;
        case 'image':
          endpoint = '/chat/send/image';
          requestBody.Image = imageMode === 'url' ? imageUrl : imageBase64;
          requestBody.Caption = imageCaption || 'Image';
          break;
        case 'audio':
          endpoint = '/chat/send/audio';
          requestBody.Audio = audioBase64;
          break;
        case 'document':
          endpoint = '/chat/send/document';
          requestBody.Document = documentBase64;
          requestBody.FileName = documentFileName;
          break;
        case 'video':
          endpoint = '/chat/send/video';
          requestBody.Video = videoBase64;
          requestBody.Caption = videoCaption || 'Video';
          break;
        case 'sticker':
          endpoint = '/chat/send/sticker';
          requestBody.Sticker = stickerBase64;
          break;
        case 'location':
          endpoint = '/chat/send/location';
          requestBody.Name = locationName || 'Location';
          requestBody.Latitude = parseFloat(latitude);
          requestBody.Longitude = parseFloat(longitude);
          break;
        case 'contact':
          endpoint = '/chat/send/contact';
          requestBody.Name = contactName;
          requestBody.Vcard = contactVcard || `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${contactPhone}\nEND:VCARD`;
          break;
        case 'template':
          endpoint = '/chat/send/template';
          requestBody.Content = templateContent;
          requestBody.Footer = templateFooter;
          requestBody.Buttons = templateButtons.filter(btn => btn.DisplayText.trim() !== '');
          break;
      }

      const response = await fetch(`${baseUrl}/wa${endpoint}`, {
        method: 'POST',
        headers: {
          'token': selectedSession,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      setResult({
        success: response.ok,
        status: response.status,
        data: result,
        timestamp: new Date().toISOString()
      });

      if (response.ok) {
        // Clear form on success for some types
        if (type === 'text') {
          setMessageBody('');
        } else if (type === 'image') {
          setImageUrl('');
          setImageFile(null);
          setImageBase64('');
          setImageCaption('');
        }
      }

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

    const getSessionStatusBadge = (session: WhatsAppSession) => {
        if (session.connected && session.loggedIn) {
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Wifi className="w-3 h-3 mr-1" />
            Logged In
        </Badge>;
        } else if (session.connected && !session.loggedIn) {
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Smartphone className="w-3 h-3 mr-1" />
            QR Required
        </Badge>;
        } else {
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <WifiOff className="w-3 h-3 mr-1" />
            Disconnected
        </Badge>;
        }
    };

    return (
        <SubscriptionGuard featureName="WhatsApp Testing" showRefreshButton={true}>
            {loading ? (
                <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading WhatsApp sessions...</p>
                        </div>
                    </div>
                </div>
            ) : error && !sessionsData ? (
                <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
                    <Card className="border-red-200">
                        <CardContent className="pt-6">
                            <div className="text-center text-red-600">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                <p>Error: {error}</p>
                                <Button onClick={fetchSessions} className="mt-4" variant="outline">
                                    Try Again
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
            <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 bg-background">
            {/* Header */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{t('title')}</h1>
                <p className="text-sm sm:text-base text-muted-foreground">{t('description')}</p>
                </div>
            </div>

        {/* Responsive Layout: Mobile (1 col), Tablet (1 col), Desktop (2/3 + 1/3) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Section: Session Selection & Message Testing */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                {/* Session Selection */}
                <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                        <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span>Select WhatsApp Session</span>
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                        <Label htmlFor="session-select" className="text-sm sm:text-base">Available Sessions</Label>
                        <Select value={selectedSession} onValueChange={setSelectedSession}>
                            <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                            <SelectValue placeholder="Choose a WhatsApp session to test with" />
                            </SelectTrigger>
                            <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-none">
                            {sessionsData?.sessions.map((session) => {
                                const isLoggedIn = session.connected && session.loggedIn;
                                return (
                                <SelectItem 
                                    key={session.token} 
                                    value={session.token}
                                    disabled={!isLoggedIn}
                                    className={`${!isLoggedIn ? 'opacity-50' : ''} p-2 sm:p-3`}
                                >
                                    <div className="flex items-center justify-between w-full rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                                            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0" />
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="font-medium text-left text-xs sm:text-sm truncate">{session.sessionName}</span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {session.jid 
                                                        ? `+${session.jid.replace('@s.whatsapp.net', '').split(':')[0]}` 
                                                        : 'Not connected'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
                                            {getSessionStatusBadge(session)}
                                        </div>
                                    </div>
                                </SelectItem>
                                );
                            })}
                            </SelectContent>
                        </Select>
                        {sessionsData?.sessions.length === 0 && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                            No WhatsApp sessions found. Create a session first.
                            </p>
                        )}
                        </div>
                    </div>
                    </CardContent>
                </Card>

                {/* Message Testing */}
                {selectedSession && (
                    <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span>Send Test Messages</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                        {/* Message Type Selector */}
                        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                            <Label className="text-sm sm:text-base">Message Type</Label>
                            <Select value={selectedMessageType} onValueChange={(value: any) => setSelectedMessageType(value)}>
                                <SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base">
                                    <SelectValue>
                                        <div className="flex items-center space-x-2">
                                            {selectedMessageType === 'text' && <MessageSquare className="w-4 h-4" />}
                                            {selectedMessageType === 'image' && <ImageIcon className="w-4 h-4" />}
                                            {selectedMessageType === 'audio' && <Mic className="w-4 h-4" />}
                                            {selectedMessageType === 'document' && <FileText className="w-4 h-4" />}
                                            {selectedMessageType === 'video' && <Video className="w-4 h-4" />}
                                            {selectedMessageType === 'sticker' && <Smile className="w-4 h-4" />}
                                            {selectedMessageType === 'location' && <MapPin className="w-4 h-4" />}
                                            {selectedMessageType === 'contact' && <Users className="w-4 h-4" />}
                                            {selectedMessageType === 'template' && <Layout className="w-4 h-4" />}
                                            <span className="capitalize">{selectedMessageType} Message</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-none">
                                    <SelectItem value="text" className="p-2 sm:p-3">
                                        <div className="flex items-center space-x-2">
                                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">Text Message</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="image" className="p-2 sm:p-3">
                                        <div className="flex items-center space-x-2">
                                            <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">Image Message</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="audio" className="p-2 sm:p-3">
                                        <div className="flex items-center space-x-2">
                                            <Mic className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">Audio Message</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="document" className="p-2 sm:p-3">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">Document Message</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="video" className="p-2 sm:p-3">
                                        <div className="flex items-center space-x-2">
                                            <Video className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">Video Message</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="sticker" className="p-2 sm:p-3">
                                        <div className="flex items-center space-x-2">
                                            <Smile className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">Sticker Message</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="location" className="p-2 sm:p-3">
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">Location Message</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="contact" className="p-2 sm:p-3">
                                        <div className="flex items-center space-x-2">
                                            <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">Contact Message</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="template" className="p-2 sm:p-3">
                                        <div className="flex items-center space-x-2">
                                            <Layout className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="text-sm sm:text-base">Template Message</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Message Form */}
                        <div className="space-y-3 sm:space-y-4">
                        <Tabs value={selectedMessageType} className="space-y-3 sm:space-y-4">
                            {/* Phone Number Input (Common) */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                                <Input
                                id="phone"
                                placeholder="e.g., 6281234567890 (with country code)"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="h-10 sm:h-11 text-sm sm:text-base"
                                />
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                Include country code (e.g., 62 for Indonesia, 1 for US)
                                </p>
                            </div>

                            <TabsContent value="text" className="space-y-3 sm:space-y-4">
                                <div className="space-y-2">
                                <Label htmlFor="message" className="text-sm sm:text-base">Message Body</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Enter your test message here..."
                                    value={messageBody}
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    rows={3}
                                    className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px] resize-none"
                                />
                                </div>
                                
                                <Button 
                                onClick={() => sendMessage('text')} 
                                disabled={sending || !selectedSession || !phoneNumber || !messageBody}
                                className="w-full h-10 sm:h-11 text-sm sm:text-base"
                                >
                                {sending ? (
                                    <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                    </>
                                ) : (
                                    <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Text Message
                                    </>
                                )}
                                </Button>
                            </TabsContent>

                            <TabsContent value="image" className="space-y-3 sm:space-y-4">
                                <div className="space-y-2 sm:space-y-3">
                                <Label className="text-sm sm:text-base">Image Source</Label>
                                <Tabs value={imageMode} onValueChange={(value) => setImageMode(value as 'base64' | 'url')}>
                                    <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
                                    <TabsTrigger value="url" className="text-xs sm:text-sm">
                                        <Link className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">Image URL</span>
                                        <span className="sm:hidden">URL</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="base64" className="text-xs sm:text-sm">
                                        <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">Upload File</span>
                                        <span className="sm:hidden">Upload</span>
                                    </TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="url" className="space-y-2">
                                    <Input
                                        placeholder="https://example.com/image.jpg"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="h-10 sm:h-11 text-sm sm:text-base"
                                    />
                                    </TabsContent>
                                    
                                    <TabsContent value="base64" className="space-y-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="h-10 sm:h-11 text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
                                    />
                                    {imageFile && (
                                        <div className="space-y-2">
                                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                            Selected: {imageFile.name}
                                        </p>
                                        {processingImage && (
                                            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                            <span>Processing image...</span>
                                            </div>
                                        )}
                                        
                                        </div>
                                    )}
                                    </TabsContent>
                                </Tabs>
                                </div>

                                <div className="space-y-2">
                                <Label htmlFor="caption" className="text-sm sm:text-base">Image Caption</Label>
                                <Input
                                    id="caption"
                                    placeholder="Optional caption for the image"
                                    value={imageCaption}
                                    onChange={(e) => setImageCaption(e.target.value)}
                                    className="h-10 sm:h-11 text-sm sm:text-base"
                                />
                                </div>
                                
                                <Button 
                                onClick={() => sendMessage('image')} 
                                disabled={sending || !selectedSession || !phoneNumber || (imageMode === 'url' ? !imageUrl : !imageBase64)}
                                className="w-full h-10 sm:h-11 text-sm sm:text-base"
                                >
                                {sending ? (
                                    <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                    </>
                                ) : (
                                    <>
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Send Image Message
                                    </>
                                )}
                                </Button>
                            </TabsContent>

                            <TabsContent value="audio" className="space-y-4">
                                <div>
                                <Label>Audio File (Base64 only)</Label>
                                <Input
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioUpload}
                                />
                                {audioFile && (
                                    <div className="space-y-2 mt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Selected: {audioFile.name}
                                    </p>
                                    {processingAudio && (
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing audio...</span>
                                        </div>
                                    )}
                                    </div>
                                )}
                                </div>
                                
                                <Button 
                                onClick={() => sendMessage('audio')} 
                                disabled={sending || !selectedSession || !phoneNumber || !audioBase64}
                                className="w-full"
                                >
                                {sending ? (
                                    <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                    </>
                                ) : (
                                    <>
                                    <Mic className="w-4 h-4 mr-2" />
                                    Send Audio Message
                                    </>
                                )}
                                </Button>
                            </TabsContent>

                            <TabsContent value="document" className="space-y-4">
                                <div>
                                <Label>Document File</Label>
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
                                    onChange={handleDocumentUpload}
                                />
                                {documentFile && (
                                    <div className="space-y-2 mt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Selected: {documentFile.name}
                                    </p>
                                    {processingDocument && (
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing document...</span>
                                        </div>
                                    )}
                                    </div>
                                )}
                                </div>
                                
                                <Button 
                                onClick={() => sendMessage('document')} 
                                disabled={sending || !selectedSession || !phoneNumber || !documentBase64}
                                className="w-full"
                                >
                                {sending ? (
                                    <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                    </>
                                ) : (
                                    <>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Send Document
                                    </>
                                )}
                                </Button>
                            </TabsContent>

                            <TabsContent value="video" className="space-y-4">
                                <div>
                                <Label>Video File</Label>
                                <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoUpload}
                                />
                                {videoFile && (
                                    <div className="space-y-2 mt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Selected: {videoFile.name}
                                    </p>
                                    {processingVideo && (
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing video...</span>
                                        </div>
                                    )}
                                    </div>
                                )}
                                </div>

                                <div>
                                <Label htmlFor="video-caption">Video Caption</Label>
                                <Input
                                    id="video-caption"
                                    placeholder="Optional caption for the video"
                                    value={videoCaption}
                                    onChange={(e) => setVideoCaption(e.target.value)}
                                />
                                </div>
                                
                                <Button 
                                onClick={() => sendMessage('video')} 
                                disabled={sending || !selectedSession || !phoneNumber || !videoBase64}
                                className="w-full"
                                >
                                {sending ? (
                                    <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                    </>
                                ) : (
                                    <>
                                    <Video className="w-4 h-4 mr-2" />
                                    Send Video Message
                                    </>
                                )}
                                </Button>
                            </TabsContent>

                            <TabsContent value="sticker" className="space-y-4">
                                <div>
                                <Label>Sticker File (WebP format recommended)</Label>
                                <Input
                                    type="file"
                                    accept=".webp,image/*"
                                    onChange={handleStickerUpload}
                                />
                                {stickerFile && (
                                    <div className="space-y-2 mt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Selected: {stickerFile.name}
                                    </p>
                                    {processingSticker && (
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing sticker...</span>
                                        </div>
                                    )}
                                    </div>
                                )}
                                </div>
                                
                                <Button 
                                onClick={() => sendMessage('sticker')} 
                                disabled={sending || !selectedSession || !phoneNumber || !stickerBase64}
                                className="w-full"
                                >
                                {sending ? (
                                    <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                    </>
                                ) : (
                                    <>
                                    <Smile className="w-4 h-4 mr-2" />
                                    Send Sticker
                                    </>
                                )}
                                </Button>
                            </TabsContent>

                            <TabsContent value="location" className="space-y-4">
                                <div>
                                <Label htmlFor="location-name">Location Name</Label>
                                <Input
                                    id="location-name"
                                    placeholder="e.g., Office, Home, Restaurant"
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                />
                                </div>

                                <div className="space-y-4">
                                <Label>Select Location on Map</Label>
                                <div className="bg-muted p-3 rounded-lg mb-4">
                                    <p className="text-sm text-muted-foreground">
                                    🗺️ Click anywhere on the map to set coordinates, or enter them manually below.
                                    </p>
                                </div>
                                
                                <LeafletMap 
                                    onLocationSelect={handleLocationSelect}
                                    selectedLat={latitude ? parseFloat(latitude) : undefined}
                                    selectedLng={longitude ? parseFloat(longitude) : undefined}
                                    height="300px"
                                    className="mb-4"
                                />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input
                                    id="latitude"
                                    placeholder="e.g., 48.858"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input
                                    id="longitude"
                                    placeholder="e.g., 2.294"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    />
                                </div>
                                </div>

                                <div className="bg-muted p-3 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    💡 Tip: You can also use <a href="https://www.openstreetmap.org/" target="_blank" className="text-blue-600 hover:underline">OpenStreetMap</a> or Google Maps to find coordinates. Right-click on a location and copy the coordinates.
                                </p>
                                </div>
                                
                                <Button 
                                onClick={() => sendMessage('location')} 
                                disabled={sending || !selectedSession || !phoneNumber || !latitude || !longitude}
                                className="w-full"
                                >
                                {sending ? (
                                    <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                    </>
                                ) : (
                                    <>
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Send Location
                                    </>
                                )}
                                </Button>
                            </TabsContent>

                            <TabsContent value="contact" className="space-y-4">
                                <div>
                                <Label htmlFor="contact-name">Contact Name</Label>
                                <Input
                                    id="contact-name"
                                    placeholder="e.g., John Doe"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                />
                                </div>

                                <div>
                                <Label htmlFor="contact-phone">Contact Phone</Label>
                                <Input
                                    id="contact-phone"
                                    placeholder="e.g., +16175551212"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                />
                                </div>

                                <div>
                                <Label htmlFor="contact-vcard">Custom VCard (Optional)</Label>
                                <Textarea
                                    id="contact-vcard"
                                    placeholder="Leave empty for auto-generated VCard or enter custom VCard"
                                    value={contactVcard}
                                    onChange={(e) => setContactVcard(e.target.value)}
                                    rows={3}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Auto-generated format: BEGIN:VCARD\nVERSION:3.0\nFN:Name\nTEL:Phone\nEND:VCARD
                                </p>
                                </div>
                                
                                <Button 
                                onClick={() => sendMessage('contact')} 
                                disabled={sending || !selectedSession || !phoneNumber || !contactName || !contactPhone}
                                className="w-full"
                                >
                                {sending ? (
                                    <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                    </>
                                ) : (
                                    <>
                                    <Users className="w-4 h-4 mr-2" />
                                    Send Contact
                                    </>
                                )}
                                </Button>
                            </TabsContent>

                            <TabsContent value="template" className="space-y-4">
                                <div>
                                <Label htmlFor="template-content">Template Title/Content</Label>
                                <Input
                                    id="template-content"
                                    placeholder="e.g., Welcome Message"
                                    value={templateContent}
                                    onChange={(e) => setTemplateContent(e.target.value)}
                                />
                                </div>

                                <div>
                                <Label htmlFor="template-footer">Footer (Optional)</Label>
                                <Input
                                    id="template-footer"
                                    placeholder="e.g., Best regards, Team"
                                    value={templateFooter}
                                    onChange={(e) => setTemplateFooter(e.target.value)}
                                />
                                </div>

                                <div>
                                <Label>Quick Reply Buttons</Label>
                                {templateButtons.map((button, index) => (
                                    <div key={index} className="flex space-x-2 mt-2">
                                    <Input
                                        placeholder={`Button ${index + 1} text`}
                                        value={button.DisplayText}
                                        onChange={(e) => {
                                        const newButtons = [...templateButtons];
                                        newButtons[index].DisplayText = e.target.value;
                                        setTemplateButtons(newButtons);
                                        }}
                                    />
                                    {templateButtons.length > 1 && (
                                        <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newButtons = templateButtons.filter((_, i) => i !== index);
                                            setTemplateButtons(newButtons);
                                        }}
                                        >
                                        Remove
                                        </Button>
                                    )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                    if (templateButtons.length < 3) {
                                        setTemplateButtons([...templateButtons, { DisplayText: '', Type: 'quickreply' }]);
                                    }
                                    }}
                                    disabled={templateButtons.length >= 3}
                                    className="mt-2"
                                >
                                    Add Button (Max 3)
                                </Button>
                                </div>
                                
                                <Button 
                                onClick={() => sendMessage('template')} 
                                disabled={sending || !selectedSession || !phoneNumber || !templateContent}
                                className="w-full"
                                >
                                {sending ? (
                                    <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                    </>
                                ) : (
                                    <>
                                    <Layout className="w-4 h-4 mr-2" />
                                    Send Template
                                    </>
                                )}
                                </Button>
                            </TabsContent>
                        </Tabs>
                        </div>
                    </CardContent>
                    </Card>
                )}
            </div>

            {/* Right Section: Response, Commands, Base64 */}
            <div className="xl:col-span-1 space-y-4 sm:space-y-6">
                {/* Error Display */}
                {error && (
                    <Alert variant="destructive" className="p-3 sm:p-4">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                    </Alert>
                )}

                {/* Result Display */}
                {result && (
                    <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                        {result.success ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                        )}
                        <span>Response</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
                            <Badge variant={result.success ? "default" : "destructive"} className="w-fit text-xs">
                            Status: {result.status}
                            </Badge>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(result.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <pre className="bg-muted p-3 sm:p-4 rounded-lg text-xs sm:text-sm overflow-auto max-h-[200px] sm:max-h-[300px]">
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                        </div>
                    </CardContent>
                    </Card>
                )}

                {/* Curl Code Generator */}
                {selectedSession && (
                    <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                        <Code className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span>Terminal Commands</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                        <div className="space-y-3 sm:space-y-4">
                            <Label className="text-sm sm:text-base">Copy this command to run in your terminal:</Label>
                            <div className="relative">
                            <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 lg:p-6 rounded-lg text-xs sm:text-sm overflow-auto font-mono border shadow-inner leading-relaxed max-h-[200px] sm:max-h-[300px]">
                                {generateCurlCommand(selectedMessageType)}
                            </pre>
                            <Button
                                type="button"
                                size="sm"
                                className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white hover:bg-gray-100 text-black border shadow-sm h-7 w-7 sm:h-8 sm:w-8 p-0"
                                onClick={() => copyToClipboard(generateCurlCommand(selectedMessageType), selectedMessageType)}
                            >
                                {(selectedMessageType === 'text' && copiedCode) ||
                                 (selectedMessageType === 'image' && copiedImageCode) ||
                                 (selectedMessageType === 'audio' && copiedAudioCode) ||
                                 (selectedMessageType === 'document' && copiedDocumentCode) ||
                                 (selectedMessageType === 'video' && copiedVideoCode) ||
                                 (selectedMessageType === 'sticker' && copiedStickerCode) ||
                                 (selectedMessageType === 'location' && copiedLocationCode) ||
                                 (selectedMessageType === 'contact' && copiedContactCode) ||
                                 (selectedMessageType === 'template' && copiedTemplateCode) ? (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                            </Button>
                            </div>
                        </div>
                    </CardContent>
                    </Card>
                )}

                {/* Base64 Generator */}
                {imageFile && imageBase64 && (
                    <Card>
                    <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                        <FileImage className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span>Base64 Generated Data</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                        <Label className="text-sm sm:text-base">Generated Base64 (Ready to use in API):</Label>
                        <div className="relative">
                            <Textarea
                            value={imageBase64}
                            readOnly
                            className="bg-gray-900 text-green-400 font-mono text-xs sm:text-sm min-h-[100px] sm:min-h-[120px] max-h-[200px] resize-none border shadow-inner"
                            placeholder="Base64 data will appear here..."
                            />
                            <Button
                            type="button"
                            size="sm"
                            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white hover:bg-gray-100 text-black border shadow-sm h-7 w-7 sm:h-8 sm:w-8 p-0"
                            onClick={() => copyToClipboard(imageBase64, 'image')}
                            >
                            {copiedImageCode ? (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                            </Button>
                        </div>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                        <p className="truncate">File: {imageFile.name}</p>
                        <p>Size: {(imageBase64.length * 0.75 / 1024).toFixed(2)} KB</p>
                        </div>
                    </CardContent>
                    </Card>
                )}
            </div>
        </div>
        </div>
            )}
        </SubscriptionGuard>
    );
}
