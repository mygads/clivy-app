"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Search,
  Copy,
  CheckCircle,
  Code,
  MessageSquare,
  User,
  Settings,
  ImageIcon,
  FileText,
  Video,
  Phone,
  MapPin,
  Users,
  Download,
  Upload,
  Wifi,
  Server,
  Key,
  Database,
  Link as LinkIcon,
  ArrowUp,
  Menu,
  X
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  requestBody?: any;
  responseExample: any;
  icon: React.ReactNode;
  category: string;
}

// ------------------------------------------------------------
// Endpoint Definitions (grouped)
// ------------------------------------------------------------
const apiEndpoints: APIEndpoint[] = [
  // Session endpoints
  {
    method: 'POST',
    path: '/session/connect',
    title: 'Connect to WhatsApp',
    description: 'Initiates connection to WhatsApp servers. Generates QR code if no previous session exists.',
    category: 'Session',
    icon: <Wifi className="w-4 h-4" />,
    requestBody: {
      Subscribe: ["Message", "ChatPresence"],
      Immediate: true
    },
    responseExample: {
      code: 200,
      data: {
        details: "Connected!",
        events: "Message",
        jid: "5491155555555.0:53@s.whatsapp.net",
        webhook: "https://some.site/webhook?request=parameter"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/session/disconnect',
    title: 'Disconnect from WhatsApp',
    description: 'Closes connection to WhatsApp servers without terminating session.',
    category: 'Session',
    icon: <Wifi className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        Details: "Disconnected"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/session/logout',
    title: 'Logout from WhatsApp',
    description: 'Closes connection and terminates session. QR scan will be needed on next connect.',
    category: 'Session',
    icon: <Wifi className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        Details: "Logged out"
      },
      success: true
    }
  },
  {
    method: 'GET',
    path: '/session/status',
    title: 'Get Session Status',
    description: 'Gets connection and session status including websocket and login status.',
    category: 'Session',
    icon: <Settings className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        Connected: true,
        LoggedIn: true
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/session/pairphone',
    title: 'Pair by Phone',
    description: 'Gets pairing code for phone number instead of QR code.',
    category: 'Session',
    icon: <Phone className="w-4 h-4" />,
    requestBody: {
      Phone: "5491155553934"
    },
    responseExample: {
      code: 200,
      data: {
        LinkingCode: "9H3J-H3J8"
      },
      success: true
    }
  },
  {
    method: 'GET',
    path: '/session/qr',
    title: 'Get QR Code',
    description: 'Gets QR code for scanning if user is connected but not logged in.',
    category: 'Session',
    icon: <Code className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        QRCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX..."
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/session/proxy',
    title: 'Set Proxy Configuration',
    description: 'Sets or disables proxy configuration for the user.',
    category: 'Session',
    icon: <Server className="w-4 h-4" />,
    requestBody: {
      proxy_url: "socks5://user:pass@host:port",
      enable: true
    },
    responseExample: {
      Details: "Proxy configured successfully",
      ProxyURL: "socks5://user:pass@host:port"
    }
  },
  {
    method: 'POST',
    path: '/session/s3/config',
    title: 'Configure S3 Storage',
    description: 'Configures S3 storage settings for media files. Supports AWS S3, MinIO, Backblaze B2.',
    category: 'Session',
    icon: <Database className="w-4 h-4" />,
    requestBody: {
      enabled: true,
      endpoint: "https://s3.amazonaws.com",
      region: "us-east-1",
      bucket: "my-whatsapp-media",
      access_key: "AKIAIOSFODNN7EXAMPLE",
      secret_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      path_style: false,
      public_url: "https://cdn.example.com",
      media_delivery: "both",
      retention_days: 30
    },
    responseExample: {
      code: 200,
      data: {
        Details: "S3 configuration saved successfully",
        Enabled: true
      },
      success: true
    }
  },
  
  // User endpoints
  {
    method: 'POST',
    path: '/user/info',
    title: 'Get User Information',
    description: 'Gets extra information about users on WhatsApp.',
    category: 'User',
    icon: <User className="w-4 h-4" />,
    requestBody: {
      Phone: ["5491155553934", "5491155553935"]
    },
    responseExample: {
      code: 200,
      data: {
        Users: {
          "5491155553935@s.whatsapp.net": {
            Devices: [],
            PictureID: "",
            Status: "",
            VerifiedName: null
          },
          "5491155553934@s.whatsapp.net": {
            Devices: ["5491155553934.0:0@s.whatsapp.net"],
            PictureID: "1582328807",
            Status: "🇦🇷",
            VerifiedName: null
          }
        }
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/user/check',
    title: 'Check WhatsApp User',
    description: 'Checks if users have an account with WhatsApp.',
    category: 'User',
    icon: <User className="w-4 h-4" />,
    requestBody: {
      Phone: ["5491155553934", "5491155553935"]
    },
    responseExample: {
      code: 200,
      data: {
        Users: [
          {
            IsInWhatsapp: true,
            JID: "5491155553934@s.whatsapp.net",
            Query: "5491155553934",
            VerifiedName: "Company Name"
          }
        ]
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/user/presence',
    title: 'Set User Presence',
    description: 'Sends user presence Available or Unavailable.',
    category: 'User',
    icon: <User className="w-4 h-4" />,
    requestBody: {
      type: "available"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Presence set successfuly"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/user/avatar',
    title: 'Get Profile Picture',
    description: 'Gets profile picture information, either thumbnail or full picture.',
    category: 'User',
    icon: <ImageIcon className="w-4 h-4" />,
    requestBody: {
      Phone: "5491155553934",
      Preview: true
    },
    responseExample: {
      URL: "https://pps.whatsapp.net/v/t61.24694-24/227295214_112447507729487_4643695328050510566_n.jpg",
      ID: "1645308319",
      Type: "preview",
      DirectPath: "/v/t61.24694-24/227295214_112447507729487_4643695328050510566_n.jpg"
    }
  },
  {
    method: 'GET',
    path: '/user/contacts',
    title: 'Get All Contacts',
    description: 'Gets complete list of contacts for the connected account.',
    category: 'User',
    icon: <Users className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        "5491122223333@s.whatsapp.net": {
          BusinessName: "",
          FirstName: "",
          Found: true,
          FullName: "",
          PushName: "Contact Name"
        }
      }
    }
  },

  // Chat endpoints
  {
    method: 'POST',
    path: '/chat/send/text',
    title: 'Send Text Message',
    description: 'Sends a text message. Phone and Body are mandatory.',
    category: 'Chat',
    icon: <MessageSquare className="w-4 h-4" />,
    requestBody: {
      Phone: "5491155553935",
      Body: "How you doin",
      Id: "ABCDABCD1234",
      ContextInfo: {
        StanzaId: "3EB06F9067F80BAB89FF",
        Participant: "5491155553935@s.whatsapp.net"
      }
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Sent",
        Id: "90B2F8B13FAC8A9CF6B06E99C7834DC5",
        Timestamp: "2022-04-20T12:49:08-03:00"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/chat/send/image',
    title: 'Send Image Message',
    description: 'Sends an image message (base64 encoded in PNG or JPEG format).',
    category: 'Chat',
    icon: <ImageIcon className="w-4 h-4" />,
    requestBody: {
      Phone: "5491155553935",
      Image: "data:image/jpeg;base64,iVBORw0",
      Caption: "Image Description",
      Id: "ABCDABCD1234"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Sent",
        Id: "90B2F8B13FAC8A9CF6B06E99C7834DC5",
        Timestamp: "2022-04-20T12:49:08-03:00"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/chat/send/document',
    title: 'Send Document',
    description: 'Sends any document (base64 encoded using application/octet-stream mime).',
    category: 'Chat',
    icon: <FileText className="w-4 h-4" />,
    requestBody: {
      Phone: "5491155553935",
      Document: "data:application/octet-stream;base64,aG9sYSBxdWUKdGFsCmNvbW8KZXN0YXMK",
      FileName: "file.txt",
      Id: "ABCDABCD1234"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Sent",
        Id: "90B2F8B13FAC8A9CF6B06E99C7834DC5",
        Timestamp: "2022-04-20T12:49:08-03:00"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/chat/send/video',
    title: 'Send Video Message',
    description: 'Sends a video message (base64 encoded in MP4 or 3GPP format).',
    category: 'Chat',
    icon: <Video className="w-4 h-4" />,
    requestBody: {
      Phone: "5491155553935",
      Video: "data:video/mp4;base64,iVBORw0",
      Caption: "my video",
      Id: "ABCDABCD1234",
      JpegThumbnail: "AA00D010"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Sent",
        Id: "90B2F8B13FAC8A9CF6B06E99C7834DC5",
        Timestamp: "2022-04-20T12:49:08-03:00"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/chat/send/location',
    title: 'Send Location',
    description: 'Sends a location message with coordinates.',
    category: 'Chat',
    icon: <MapPin className="w-4 h-4" />,
    requestBody: {
      Phone: "5491155553935",
      Name: "Party",
      Id: "ABCDABCD1234",
      Latitude: 48.85837,
      Longitude: 2.294481
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Sent",
        Id: "90B2F8B13FAC8A9CF6B06E99C7834DC5",
        Timestamp: "2022-04-20T12:49:08-03:00"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/chat/markread',
    title: 'Mark as Read',
    description: 'Marks one or more received messages as read.',
    category: 'Chat',
    icon: <CheckCircle className="w-4 h-4" />,
    requestBody: {
      Id: ["AABBCC11223344", "DDEEFF55667788"],
      Chat: "5491155553934.0:1@s.whatsapp.net",
      Sender: "5491155553111.0:1@s.whatsapp.net"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Message(s) marked as read"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/chat/downloadimage',
    title: 'Download Image',
    description: 'Downloads an image from a message and returns it base64 encoded.',
    category: 'Chat',
    icon: <Download className="w-4 h-4" />,
    requestBody: {
      Url: "string",
      DirectPath: "string",
      MediaKey: "string",
      Mimetype: "string",
      FileEncSHA256: "string",
      FileSHA256: "string",
      FileLength: 0
    },
    responseExample: {
      code: 200,
      data: {
        Data: "data:image/jpeg;base64,iVBORw0KGgoA5CYII...=",
        Mimetype: "image/jpeg"
      },
      success: true
    }
  },

  // Group endpoints
  {
    method: 'POST',
    path: '/group/create',
    title: 'Create a new WhatsApp group',
    description: 'Creates a new WhatsApp group with the specified name and participants.',
    category: 'Group',
    icon: <Users className="w-4 h-4" />,
    requestBody: {
      Name: "My New Group",
      Participants: [
        "5491112345678",
        "5491123456789"
      ]
    },
    responseExample: {
      code: 200,
      data: {
        AnnounceVersionID: "1234567890",
        DisappearingTimer: 0,
        GroupCreated: "2023-12-01T10:00:00Z",
        IsAnnounce: false,
        IsEphemeral: false,
        IsLocked: false,
        JID: "120363123456789@g.us",
        Name: "My New Group",
        NameSetAt: "2023-12-01T10:00:00Z",
        NameSetBy: "5491155554444@s.whatsapp.net",
        OwnerJID: "5491155554444@s.whatsapp.net",
        ParticipantVersionID: "1234567890",
        Participants: [
          {
            IsAdmin: true,
            IsSuperAdmin: true,
            JID: "5491155554444@s.whatsapp.net"
          },
          {
            IsAdmin: false,
            IsSuperAdmin: false,
            JID: "5491155553333@s.whatsapp.net"
          }
        ]
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/locked',
    title: 'Set group locked status',
    description: 'Configures whether only admins can modify group info (locked) or all participants can modify (unlocked).',
    category: 'Group',
    icon: <Settings className="w-4 h-4" />,
    requestBody: {
      GroupJID: "120363312246943103@g.us",
      Locked: true
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Group locked setting updated successfully"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/ephemeral',
    title: 'Set disappearing timer for group messages',
    description: 'Configures ephemeral/disappearing messages for the group. Messages will automatically disappear after the specified duration.',
    category: 'Group',
    icon: <Settings className="w-4 h-4" />,
    requestBody: {
      GroupJID: "120363312246943103@g.us",
      Duration: "24h"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Disappearing timer set successfully"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/photo/remove',
    title: 'Remove group photo',
    description: 'Removes the current photo/image from the specified WhatsApp group.',
    category: 'Group',
    icon: <ImageIcon className="w-4 h-4" />,
    requestBody: {
      GroupJID: "120363312246943103@g.us"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Group photo removed successfully"
      },
      success: true
    }
  },
  {
    method: 'GET',
    path: '/group/list',
    title: 'List subscribed groups',
    description: 'Returns complete list of subscribed groups',
    category: 'Group',
    icon: <Users className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        Groups: [
          {
            AnnounceVersionID: "1650572126123738",
            DisappearingTimer: 0,
            GroupCreated: "2022-04-21T17:15:26-03:00",
            IsAnnounce: false,
            IsEphemeral: false,
            IsLocked: false,
            JID: "120362023605733675@g.us",
            Name: "Super Group",
            NameSetAt: "2022-04-21T17:15:26-03:00",
            NameSetBy: "5491155554444@s.whatsapp.net",
            OwnerJID: "5491155554444@s.whatsapp.net",
            ParticipantVersionID: "1650234126145738",
            Participants: [
              {
                IsAdmin: true,
                IsSuperAdmin: true,
                JID: "5491155554444@s.whatsapp.net"
              },
              {
                IsAdmin: false,
                IsSuperAdmin: false,
                JID: "5491155553333@s.whatsapp.net"
              },
              {
                IsAdmin: false,
                IsSuperAdmin: false,
                JID: "5491155552222@s.whatsapp.net"
              }
            ],
            Topic: "",
            TopicID: "",
            TopicSetAt: "0001-01-01T00:00:00Z",
            TopicSetBy: ""
          }
        ]
      },
      success: true
    }
  },
  {
    method: 'GET',
    path: '/group/invitelink',
    title: 'Get Group Invite Link',
    description: 'Gets the invite link for a group, optionally resetting it to create a new/different one',
    category: 'Group',
    icon: <LinkIcon className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        InviteLink: "https://chat.whatsapp.com/HffXhYmzzyJGec61oqMXiz"
      },
      success: true
    }
  },
  {
    method: 'GET',
    path: '/group/info',
    title: 'Gets group information',
    description: 'Retrieves information about a specific group',
    category: 'Group',
    icon: <Users className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        AnnounceVersionID: "1650572126123738",
        DisappearingTimer: 0,
        GroupCreated: "2022-04-21T17:15:26-03:00",
        IsAnnounce: false,
        IsEphemeral: false,
        IsLocked: false,
        JID: "120362023605733675@g.us",
        Name: "Super Group",
        NameSetAt: "2022-04-21T17:15:26-03:00",
        NameSetBy: "5491155554444@s.whatsapp.net",
        OwnerJID: "5491155554444@s.whatsapp.net",
        ParticipantVersionID: "1650234126145738",
        Participants: [
          {
            IsAdmin: true,
            IsSuperAdmin: true,
            JID: "5491155554444@s.whatsapp.net"
          },
          {
            IsAdmin: false,
            IsSuperAdmin: false,
            JID: "5491155553333@s.whatsapp.net"
          },
          {
            IsAdmin: false,
            IsSuperAdmin: false,
            JID: "5491155552222@s.whatsapp.net"
          }
        ],
        Topic: "",
        TopicID: "",
        TopicSetAt: "0001-01-01T00:00:00Z",
        TopicSetBy: ""
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/photo',
    title: 'Changes group photo',
    description: 'Allows you to change a group photo/image. Returns the Picture ID number',
    category: 'Group',
    icon: <ImageIcon className="w-4 h-4" />,
    requestBody: {
      GroupJID: "120362023605733675@g.us",
      Image: "data:image/jpeg;base64,Akd9300..."
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Group Photo set successfully",
        PictureID: "1222332123"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/leave',
    title: 'Leave a WhatsApp group',
    description: 'Removes the authenticated user from the specified group.',
    category: 'Group',
    icon: <ArrowUp className="w-4 h-4" />,
    requestBody: {
      GroupJID: "120363312246943103@g.us"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Left group successfully"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/name',
    title: 'Change group name',
    description: 'Updates the name of the specified WhatsApp group.',
    category: 'Group',
    icon: <FileText className="w-4 h-4" />,
    requestBody: {
      GroupJID: "120363312246943103@g.us",
      Name: "My New Group Name"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Group Name set successfully"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/topic',
    title: 'Set group topic/description',
    description: 'Updates the topic or description of the specified WhatsApp group.',
    category: 'Group',
    icon: <FileText className="w-4 h-4" />,
    requestBody: {
      GroupJID: "120363312246943103@g.us",
      Topic: "Welcome to our project group!"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Group Topic set successfully"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/announce',
    title: 'Set group announce mode',
    description: 'Enables or disables "announce" mode (admin-only messages) for the specified group.',
    category: 'Group',
    icon: <Settings className="w-4 h-4" />,
    requestBody: {
      GroupJID: "120363312246943103@g.us",
      Announce: true
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Group Announce mode set successfully"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/join',
    title: 'Join a WhatsApp group via invite code',
    description: 'Joins the WhatsApp group using the given invite code.',
    category: 'Group',
    icon: <Users className="w-4 h-4" />,
    requestBody: {
      Code: "HffXhYmzzyJGec61oqMXiz"
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Joined group successfully"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/inviteinfo',
    title: 'Get information about a group invite code',
    description: 'Returns details about a WhatsApp group given an invite code.',
    category: 'Group',
    icon: <LinkIcon className="w-4 h-4" />,
    requestBody: {
      Code: "HffXhYmzzyJGec61oqMXiz"
    },
    responseExample: {
      code: 200,
      data: {
        InviteInfo: {
          GroupName: "Test Group",
          GroupJID: "120363312246943103@g.us"
        }
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/group/updateparticipants',
    title: 'Add, remove, promote or demote participants from a group',
    description: 'Adds or removes participants from the specified WhatsApp group.',
    category: 'Group',
    icon: <Users className="w-4 h-4" />,
    requestBody: {
      GroupJID: "120363312246943103@g.us",
      Action: "add",
      Phone: [
        "5491112345678",
        "5491123456789@s.whatsapp.net"
      ]
    },
    responseExample: {
      code: 200,
      data: {
        Details: "Participants updated successfully"
      },
      success: true
    }
  },
  // Newsletter endpoints
  {
    method: 'GET',
    path: '/newsletter/list',
    title: 'List Subscribed Newsletters',
    description: 'Returns complete list of subscribed newsletters',
    category: 'Newsletter',
    icon: <BookOpen className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        Newsletter: [
          {
            id: "120363144038483540@newsletter",
            state: {
              type: "active"
            },
            thread_metadata: {
              creation_time: "1688746895",
              description: {
                id: "1689653839450668",
                text: "WhatsApp's official channel. Follow for our latest feature launches, updates, exclusive drops and more.",
                update_time: "1689653839450668"
              },
              invite: "0029Va4K0PZ5a245NkngBA2M",
              name: {
                id: "1688746895480511",
                text: "WhatsApp",
                update_time: "1688746895480511"
              },
              picture: {
                direct_path: "/v/t61.24694-24/416962407_970228831134395_8869146381947923973_n.jpg?ccb=11-4&oh=01_Q5AaIRyTfP806JEGJDm0XWU5E-D4LcA-Wj3csSwh1jJTVanC&oe=67D550F1&_nc_sid=5e03e0&_nc_cat=110",
                id: "1707950960975554",
                type: "IMAGE",
                url: ""
              },
              preview: {
                direct_path: "/v/t61.24694-24/416962407_970228831134395_8869146381947923973_n.jpg?stp=dst-jpg_s192x192_tt6&ccb=11-4&oh=01_Q5AaIawuPXJUw9grRFJZtAJEc6QNm0XpqJq4X1Ssi9xNI0Qf&oe=67D550F1&_nc_sid=5e03e0&_nc_cat=110",
                id: "1707950960975554",
                type: "PREVIEW",
                url: ""
              },
              settings: {
                reaction_codes: {
                  value: "ALL"
                }
              },
              subscribers_count: "0",
              verification: "verified"
            },
            viewer_metadata: {
              mute: "on",
              role: "subscriber"
            }
          }
        ]
      },
      success: true
    }
  },
  // Webhook endpoints
  {
    method: 'GET',
    path: '/webhook',
    title: 'Get Webhook Configuration',
    description: 'Gets the configured webhook and subscribed events. Available event types: Message, ReadReceipt, Presence, HistorySync, ChatPresence, All (subscribes to all event types)',
    category: 'Webhook',
    icon: <Server className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        subscribe: [
          "Message",
          "ReadReceipt"
        ],
        webhook: "https://example.net/webhook"
      },
      success: true
    }
  },
  {
    method: 'POST',
    path: '/webhook',
    title: 'Set Webhook Configuration',
    description: 'Sets the webhook that will be used to POST information when messages are received and configures the events to subscribe to.',
    category: 'Webhook',
    icon: <Server className="w-4 h-4" />,
    requestBody: {
      webhook: "https://example.net/webhook",
      events: [
        "Message",
        "ReadReceipt"
      ]
    },
    responseExample: {
      code: 200,
      data: {
        WebhookURL: "https://example.net/webhook",
        Events: [
          "Message",
          "ReadReceipt"
        ]
      },
      success: true
    }
  },
  {
    method: 'DELETE',
    path: '/webhook',
    title: 'Delete Webhook Configuration',
    description: 'Removes the configured webhook and clears events for the user',
    category: 'Webhook',
    icon: <Server className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        Details: "Webhook and events deleted successfully"
      },
      success: true
    }
  },
  {
    method: 'PUT',
    path: '/webhook',
    title: 'Update Webhook Configuration',
    description: 'Updates the webhook URL, events, and activation status.',
    category: 'Webhook',
    icon: <Server className="w-4 h-4" />,
    requestBody: {
      webhook: "https://example.net/webhook",
      events: [
        "Message",
        "ReadReceipt"
      ],
      Active: true
    },
    responseExample: {
      code: 200,
      data: {
        WebhookURL: "https://example.net/webhook",
        Events: [
          "Message",
          "ReadReceipt"
        ],
        active: true
      },
      success: true
    }
  },
  {
    method: 'GET',
    path: '/webhook/events',
    title: 'Get Available Webhook Events',
    description: 'Returns the list of available webhook events that can be subscribed to. Query parameter "active" (boolean) can be set to true to return only active events.',
    category: 'Webhook',
    icon: <Database className="w-4 h-4" />,
    responseExample: {
      code: 200,
      data: {
        active_events: [
          "Message",
          "MessageSent",
          "Receipt",
          "Connected",
          "Disconnected",
          "ConnectFailure",
          "LoggedOut",
          "StreamReplaced",
          "PairSuccess",
          "QR",
          "PushNameSetting",
          "AppState",
          "AppStateSyncComplete",
          "HistorySync",
          "CallOffer",
          "CallAccept",
          "CallTerminate",
          "CallOfferNotice",
          "CallRelayLatency",
          "Presence",
          "ChatPresence",
          "All"
        ],
        all_supported_events: [
          "Message",
          "MessageSent",
          "UndecryptableMessage",
          "Receipt",
          "MediaRetry",
          "ReadReceipt",
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
          "CallOffer",
          "CallAccept",
          "CallTerminate",
          "CallOfferNotice",
          "CallRelayLatency",
          "Presence",
          "ChatPresence",
          "IdentityChange",
          "CATRefreshError",
          "NewsletterJoin",
          "NewsletterLeave",
          "NewsletterMuteChange",
          "NewsletterLiveUpdate",
          "FBMessage",
          "All"
        ],
        not_implemented_events: [
          "UndecryptableMessage",
          "MediaRetry",
          "ReadReceipt",
          "GroupInfo",
          "JoinedGroup",
          "Picture",
          "BlocklistChange",
          "Blocklist",
          "KeepAliveRestored",
          "KeepAliveTimeout",
          "ClientOutdated",
          "TemporaryBan",
          "StreamError",
          "PairError",
          "QRScannedWithoutMultidevice",
          "PrivacySettings",
          "UserAbout",
          "OfflineSyncCompleted",
          "OfflineSyncPreview",
          "IdentityChange",
          "CATRefreshError",
          "NewsletterJoin",
          "NewsletterLeave",
          "NewsletterMuteChange",
          "NewsletterLiveUpdate",
          "FBMessage"
        ]
      },
      success: true
    }
  }
];

const categoryMeta: Record<string, { title: string; description: string; icon: React.ReactElement }> = {
  Session: {
    title: 'Session Management',
    description: 'Create, connect, authenticate and configure your WhatsApp runtime environment.',
    icon: <Wifi className="w-4 h-4" />
  },
  User: {
    title: 'User Operations',
    description: 'Lookup, presence and profile utilities for WhatsApp users.',
    icon: <User className="w-4 h-4" />
  },
  Chat: {
    title: 'Chat & Messaging',
    description: 'Messaging primitives: send, edit, react, media & interaction messages.',
    icon: <MessageSquare className="w-4 h-4" />
  },
  Group: {
    title: 'Group Management',
    description: 'Create, manage, and configure WhatsApp groups, participants, and group settings.',
    icon: <Users className="w-4 h-4" />
  },
  Newsletter: {
    title: 'Newsletter Management',
    description: 'Manage and interact with WhatsApp newsletters and subscriptions.',
    icon: <BookOpen className="w-4 h-4" />
  },
  Webhook: {
    title: 'Webhook Management',
    description: 'Configure webhooks for receiving events and notifications from WhatsApp.',
    icon: <Server className="w-4 h-4" />
  }
};

// Ordered category list
const categoryOrder = ['Session', 'User', 'Chat', 'Group', 'Newsletter', 'Webhook'];

// Utility to build anchor ids
const buildId = (e: APIEndpoint) => `${e.method}-${e.path.replace(/[^a-zA-Z0-9]+/g, '-')}`.toLowerCase();

// Method color map with enhanced gradients and better contrast
const methodColor: Record<string, string> = {
  GET: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 ring-emerald-200/50 dark:from-emerald-500/10 dark:to-emerald-500/5 dark:text-emerald-300 dark:ring-emerald-500/20',
  POST: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 ring-blue-200/50 dark:from-blue-500/10 dark:to-blue-500/5 dark:text-blue-300 dark:ring-blue-500/20',
  PUT: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 ring-amber-200/50 dark:from-amber-500/10 dark:to-amber-500/5 dark:text-amber-300 dark:ring-amber-500/20',
  DELETE: 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-800 ring-rose-200/50 dark:from-rose-500/10 dark:to-rose-500/5 dark:text-rose-300 dark:ring-rose-500/20'
};

// Pretty JSON helper
const pretty = (obj: any) => JSON.stringify(obj, null, 2);

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function APIDocsPage() {
  const t = useTranslations(); // reserved for future i18n
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_API || 'http://localhost:8070';

  const filtered = useMemo(() => {
    if (!search.trim()) return apiEndpoints;
    const q = search.toLowerCase();
    return apiEndpoints.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.path.toLowerCase().includes(q) ||
      e.method.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    return categoryOrder.reduce<Record<string, APIEndpoint[]>>((acc, cat) => {
      acc[cat] = filtered.filter(e => e.category === cat);
      return acc;
    }, {});
  }, [filtered]);

  const copy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }, []);

  // Intersection Observer for active section highlight
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('[data-endpoint-anchor="true"]')) as HTMLElement[];
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] }
    );
    headings.forEach(h => io.observe(h));
    return () => { headings.forEach(h => io.unobserve(h)); };
  }, [filtered]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const EndpointBlock = ({ e }: { e: APIEndpoint }) => {
    const id = buildId(e);
    return (
      <section
        id={id}
        data-endpoint-anchor="true"
        className="group scroll-mt-20 sm:scroll-mt-24 rounded-lg sm:rounded-xl md:rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm supports-[backdrop-filter]:bg-card/70 p-3 sm:p-4 md:p-6 lg:p-7 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      >
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between min-w-0">
          <div className="space-y-2 sm:space-y-2.5 min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0 w-full xs:w-auto">
                  <span className={`inline-flex items-center rounded-md sm:rounded-lg px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold ring-1 ring-inset shadow-sm transition-all duration-200 ${methodColor[e.method] || 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/30'}`}>
                    {e.method}
                  </span>
                  <code className="text-[10px] xs:text-xs sm:text-xs md:text-sm rounded-md sm:rounded-lg bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 font-mono text-gray-100 border border-gray-600 shadow-inner break-all word-break min-w-0 max-w-full overflow-hidden">
                    {e.path}
                  </code>
                </div>
                <div className="flex items-center gap-1 self-start xs:self-auto">
                  <button
                    onClick={() => copy(`${baseUrl}${e.path}`,'url:'+id)}
                    className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md sm:rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm hover:bg-muted/80 transition-all duration-200 hover:shadow-sm"
                    aria-label="Copy URL"
                  >
                    {copied === 'url:'+id ? <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" /> : <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 dark:text-gray-400" />}
                  </button>
                  <button
                    onClick={() => copy(window.location.origin + window.location.pathname + '#' + id, 'link:'+id)}
                    className="hidden xs:inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md sm:rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm hover:bg-muted/80 transition-all duration-200 hover:shadow-sm"
                    aria-label="Copy anchor link"
                  >
                    {copied === 'link:'+id ? <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" /> : <LinkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 dark:text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight tracking-tight flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-2.5 text-foreground">
              <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary self-start xs:self-auto dark:text-white">
                {e.icon}
              </span>
              <span className="break-words hyphens-auto max-w-full overflow-hidden">{e.title}</span>
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-full sm:max-w-2xl md:max-w-3xl font-medium break-words hyphens-auto">
              {e.description}
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 xl:grid-cols-2 min-w-0">
          <div className="space-y-3 sm:space-y-4 min-w-0">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
              <h4 className="text-[10px] sm:text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-blue-500"></div>
                Request
              </h4>
              <button
                onClick={() => copy(pretty(e.requestBody ?? { }), 'req:'+id)}
                className="self-start xs:self-auto text-[10px] sm:text-xs inline-flex items-center gap-1 sm:gap-1.5 rounded-md sm:rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-muted/80 transition-all duration-200 font-medium"
              >
                {copied === 'req:'+id ? <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" /> : <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 dark:text-gray-400" />} 
                <span className="hidden xs:inline">Copy JSON</span>
                <span className="xs:hidden">Copy</span>
              </button>
            </div>
            {e.requestBody ? (
              <div className="relative overflow-hidden rounded-lg sm:rounded-xl border border-gray-600 bg-gray-900 dark:bg-gray-950 shadow-lg">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-600 bg-gray-800 dark:bg-gray-900 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">request.json</span>
                  </div>
                </div>
                <pre className="max-h-48 sm:max-h-60 md:max-h-80 overflow-auto p-3 md:p-4 text-xs sm:text-sm leading-relaxed font-mono scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 break-words whitespace-pre-wrap">
                  <code className="text-gray-100 break-words">{pretty(e.requestBody)}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 sm:py-6 md:py-8 text-xs sm:text-sm text-gray-200 italic border border-gray-600 rounded-lg sm:rounded-xl bg-gray-800 dark:bg-gray-950/50">
                No request body required
              </div>
            )}
            <div className="space-y-1.5 sm:space-y-2">
              <h5 className="text-[9px] xs:text-[10px] sm:text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 sm:gap-2">
                <div className="h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-muted-foreground/60"></div>
                Headers
              </h5>
              <div className="rounded-lg sm:rounded-xl border border-gray-600 bg-gray-900 dark:bg-gray-950 shadow-lg p-3 text-xs sm:text-sm font-mono space-y-2">
                <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                  <span className="text-gray-400 font-semibold min-w-0 flex-shrink-0">Content-Type:</span> 
                  <code className="text-gray-100 bg-gray-800 px-2 py-1 rounded text-xs break-all max-w-full overflow-hidden border border-gray-600">application/json</code>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                  <span className="text-gray-400 font-semibold min-w-0 flex-shrink-0">token:</span> 
                  <code className="text-gray-100 bg-gray-800 px-2 py-1 rounded text-xs break-all max-w-full overflow-hidden border border-gray-600">&lt;Session-Token&gt;</code>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4 min-w-0">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
              <h4 className="text-[10px] sm:text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500"></div>
                Response
              </h4>
              <button
                onClick={() => copy(pretty(e.responseExample), 'res:'+id)}
                className="self-start xs:self-auto text-[10px] sm:text-xs inline-flex items-center gap-1 sm:gap-1.5 rounded-md sm:rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-muted/80 transition-all duration-200 font-medium"
              >
                {copied === 'res:'+id ? <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" /> : <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500 dark:text-gray-400" />} 
                <span className="hidden xs:inline">Copy JSON</span>
                <span className="xs:hidden">Copy</span>
              </button>
            </div>
            <div className="relative overflow-hidden rounded-lg sm:rounded-xl border border-gray-600 bg-gray-900 dark:bg-gray-950 shadow-lg">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-600 bg-gray-800 dark:bg-gray-900 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">response.json</span>
                </div>
              </div>
              <pre className="max-h-48 sm:max-h-60 md:max-h-80 overflow-auto p-3 md:p-4 text-xs sm:text-sm leading-relaxed font-mono scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 break-words whitespace-pre-wrap">
                <code className="text-gray-100 break-words">{pretty(e.responseExample)}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const total = filtered.length;

  return (
    <div ref={containerRef} className="relative flex w-full bg-background min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-72 sm:w-80 md:w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="h-6 sm:h-8 w-6 sm:w-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-md">
                    <FaWhatsapp className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-primary dark:text-white font-bold text-sm sm:text-base tracking-tight truncate block">WhatsApp API</span>
                    <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 font-medium">Documentation</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-6 sm:h-8 w-6 sm:w-8 p-0 flex-shrink-0"
                >
                  <X className="h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search endpoints..."
                  className="pl-8 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 rounded-md sm:rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 font-bold">{total} endpoints</div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 font-medium">Live</span>
                </div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {categoryOrder.map(cat => {
                const endpoints = grouped[cat];
                if (!endpoints?.length) return null;
                const meta = categoryMeta[cat];
                return (
                  <div key={cat} className="space-y-3">
                    <div className="flex items-center gap-2.5 text-xs font-bold tracking-wider text-gray-600 dark:text-gray-300 uppercase px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center">
                        {meta.icon}
                      </div>
                      <span className="truncate">{meta.title}</span>
                      <div className="ml-auto text-[10px] bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                        {endpoints.length}
                      </div>
                    </div>
                    <ul className="space-y-1.5 pl-2">
                      {endpoints.map(e => {
                        const id = buildId(e);
                        const active = activeId === id;
                        return (
                          <li key={id}>
                            <button
                              onClick={() => {
                                scrollTo(id);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`group w-full text-left rounded-lg px-3 py-2.5 text-xs font-medium flex items-center justify-between transition-all duration-200 ${active 
                                ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20 shadow-sm' 
                                : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <span className="truncate flex-1 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full transition-all duration-200 ${active 
                                  ? 'bg-gradient-to-r from-primary to-primary/60 shadow-md shadow-primary/30' 
                                  : 'bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/20 group-hover:from-primary/60 group-hover:to-primary/40'
                                }`} />
                                <span className="leading-tight truncate">{e.title}</span>
                              </span>
                              <span className={`ml-3 shrink-0 rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset transition-all duration-200 ${methodColor[e.method]}`}>
                                {e.method}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-gradient-to-br from-background via-background to-muted/10 lg:pr-72 xl:pr-80 2xl:pr-96">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">{/* improved responsive padding */}
          {/* Header */}
          <header className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
                    <FaWhatsapp className="h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 text-white" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent break-words">
                      WhatsApp API Reference
                    </h1>
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
                      <Badge variant="outline" className="font-semibold text-[10px] sm:text-xs border-emerald-300/50 text-emerald-700 bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300 dark:bg-emerald-500/10 px-1.5 py-0.5">
                        Production Ready
                      </Badge>
                      <Badge variant="outline" className="font-semibold text-[10px] sm:text-xs border-blue-300/50 text-blue-700 bg-blue-50 dark:border-blue-500/30 dark:text-blue-300 dark:bg-blue-500/10 px-1.5 py-0.5">
                        Version 2.1.1
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* Mobile Menu Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden flex items-center gap-1.5 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  {isMobileMenuOpen ? <X className="h-3 sm:h-4 w-3 sm:w-4" /> : <Menu className="h-3 sm:h-4 w-3 sm:w-4" />}
                  <span className="hidden sm:inline">Menu</span>
                </Button>
              </div>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-4xl leading-relaxed font-medium">
                A comprehensive, production‑ready reference for integrating WhatsApp messaging, session management, media delivery and user utilities. 
                Built for developers who value clarity, speed and reliability.
              </p>
            </div>
            <div className="lg:hidden">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search endpoints..."
                  className="pl-9 sm:pl-11 h-10 sm:h-12 text-sm sm:text-base border-border/50 bg-background/80 backdrop-blur-sm shadow-sm"
                />
              </div>
            </div>
          </header>

          {/* Base URL Display */}
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border border-border/30 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm shadow-sm">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 rounded-md sm:rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200/50 flex items-center justify-center dark:from-blue-500/20 dark:to-blue-500/10 dark:border-blue-500/30">
                  <Server className="h-3 sm:h-3.5 md:h-4 w-3 sm:w-3.5 md:w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">API Base URL</h3>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 font-medium">Current server endpoint</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
                <code className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-mono bg-gray-900 border border-gray-600 rounded-md sm:rounded-lg text-gray-100 break-all shadow-inner overflow-x-auto">
                  {baseUrl}
                </code>
                <button
                  onClick={() => copy(baseUrl, 'baseUrl')}
                  className="self-start sm:self-auto inline-flex items-center gap-1 sm:gap-1.5 rounded-md sm:rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-muted/80 transition-all duration-200 text-[10px] sm:text-xs font-medium"
                >
                  {copied === 'baseUrl' ? <CheckCircle className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-emerald-500" /> : <Copy className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-gray-500 dark:text-gray-400" />} 
                  <span className="hidden xs:inline">Copy</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Sections */}
          <div className="space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-14">
            {categoryOrder.map(cat => {
              const endpoints = grouped[cat];
              if (!endpoints?.length) return null;
              const meta = categoryMeta[cat];
              return (
                <div key={cat} className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4">
                      <div className="h-6 sm:h-7 md:h-8 lg:h-9 xl:h-10 w-6 sm:w-7 md:w-8 lg:w-9 xl:w-10 rounded-md sm:rounded-lg md:rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 flex items-center justify-center">
                        <div className="h-3 sm:h-3.5 md:h-4 lg:h-4.5 xl:h-5 w-3 sm:w-3.5 md:w-4 lg:w-4.5 xl:w-5">
                          {meta.icon}
                        </div>
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight break-words">{meta.title}</h2>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{meta.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {endpoints.map(e => <EndpointBlock key={buildId(e)} e={e} />)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Important Notes */}
          <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 space-y-4 sm:space-y-6 md:space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4">
                <div className="h-6 sm:h-7 md:h-8 lg:h-10 w-6 sm:w-7 md:w-8 lg:w-10 rounded-md sm:rounded-lg md:rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200/50 flex items-center justify-center dark:from-amber-500/20 dark:to-amber-500/10 dark:border-amber-500/30">
                  <BookOpen className="h-3 sm:h-3.5 md:h-4 lg:h-5 w-3 sm:w-3.5 md:w-4 lg:w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight">Usage Notes</h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">Key considerations when consuming the API in production environments.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2">
              <Alert className="border-border/40 bg-gradient-to-br from-background to-muted/10 backdrop-blur-sm shadow-sm p-3 sm:p-4">
                <Code className="h-3 sm:h-4 w-3 sm:w-4" />
                <AlertDescription className="text-[10px] sm:text-xs md:text-sm leading-relaxed">
                  <strong className="font-semibold">Media:</strong> Send media as Base64 data URIs (e.g. <code className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-gray-800 text-gray-100 text-[9px] sm:text-xs font-mono border border-gray-600">data:image/jpeg;base64,...</code>). Consider S3 integration for large/long‑lived assets.
                </AlertDescription>
              </Alert>
              <Alert className="border-border/40 bg-gradient-to-br from-background to-muted/10 backdrop-blur-sm shadow-sm p-3 sm:p-4">
                <Upload className="h-3 sm:h-4 w-3 sm:w-4" />
                <AlertDescription className="text-[10px] sm:text-xs md:text-sm leading-relaxed">
                  <strong className="font-semibold">Rate Limiting:</strong> Implement idempotency + retry with backoff. Respect HTTP 429 and related headers.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Back to top */}
          <div className="mt-8 sm:mt-12 md:mt-16 flex justify-center sm:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="gap-1 sm:gap-1.5 h-8 sm:h-9 md:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium"
            >
              <ArrowUp className="h-3 sm:h-3.5 md:h-4 w-3 sm:w-3.5 md:w-4" /> 
              <span>Back to Top</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Desktop Sidebar */}
      <aside className="fixed top-16 right-0 z-30 h-[calc(100vh-4rem)] w-64 lg:w-72 xl:w-80 2xl:w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hidden lg:flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 space-y-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-md">
              <FaWhatsapp className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-primary dark:text-white font-bold text-sm lg:text-base tracking-tight truncate block">WhatsApp API</span>
              <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Documentation</div>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search endpoints..."
              className="pl-10 h-10 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 rounded-lg"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 font-bold">{total} endpoints</div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Live</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 lg:px-4 py-4 lg:py-6 space-y-4 lg:space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {categoryOrder.map(cat => {
            const endpoints = grouped[cat];
            if (!endpoints?.length) return null;
            const meta = categoryMeta[cat];
            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-bold tracking-wider text-gray-600 dark:text-gray-300 uppercase px-2 lg:px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <div className="h-5 lg:h-6 w-5 lg:w-6 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 text-primary dark:text-white flex items-center justify-center">
                    {meta.icon}
                  </div>
                  <span className="truncate flex-1 text-[10px] lg:text-xs">{meta.title}</span>
                  <div className="ml-auto text-[9px] lg:text-[10px] bg-gray-200 dark:bg-gray-600 px-1.5 lg:px-2 py-0.5 rounded-full">
                    {endpoints.length}
                  </div>
                </div>
                <ul className="space-y-1.5 pl-1 lg:pl-2">
                  {endpoints.map(e => {
                    const id = buildId(e);
                    const active = activeId === id;
                    return (
                      <li key={id}>
                        <button
                          onClick={() => scrollTo(id)}
                          className={`group w-full text-left rounded-lg px-2 lg:px-3 py-2 lg:py-2.5 text-[10px] lg:text-xs font-medium flex items-center justify-between transition-all duration-200 ${active 
                            ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20 shadow-sm' 
                            : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <span className="truncate flex-1 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full transition-all duration-200 ${active 
                              ? 'bg-gradient-to-r from-primary to-primary/60 shadow-md shadow-primary/30' 
                              : 'bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/20 group-hover:from-primary/60 group-hover:to-primary/40'
                            }`} />
                            <span className="leading-tight truncate">{e.title}</span>
                          </span>
                          <span className={`ml-2 lg:ml-3 shrink-0 rounded-md px-1.5 lg:px-2 py-0.5 lg:py-1 text-[9px] lg:text-[10px] font-bold ring-1 ring-inset transition-all duration-200 ${methodColor[e.method]}`}>
                            {e.method}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-3 lg:p-4 space-y-3 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
          <p className="leading-relaxed font-medium text-[10px] lg:text-xs">
            Professional-grade API reference for WhatsApp integration with production-ready examples.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[9px] lg:text-[10px] font-semibold border-primary/20 text-primary/80 dark:text-white dark:border-gray-300">Production Ready</Badge>
            <Badge variant="outline" className="text-[9px] lg:text-[10px] font-semibold">version 2.1.1</Badge>
          </div>
        </div>
      </aside>
    </div>
  );
}
