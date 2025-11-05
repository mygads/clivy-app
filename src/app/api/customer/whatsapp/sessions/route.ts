import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth } from "@/lib/auth-helpers";
import { hasActiveWhatsAppSubscription, getWhatsAppSubscriptionStatus } from "@/lib/whatsapp-subscription";
import { z } from "zod";

const WHATSAPP_SERVER_API = process.env.WHATSAPP_SERVER_API;
const WHATSAPP_ADMIN_TOKEN = process.env.WHATSAPP_ADMIN_TOKEN;

// Type definition for external session data
interface ExternalSession {
  id: string;
  name: string;
  token: string;
  webhook?: string;
  events?: string;
  expiration?: number;
  connected?: boolean;
  loggedIn?: boolean;
  jid?: string;
  qrcode?: string;
  proxy_config?: {
    enabled?: boolean;
    proxy_url?: string;
  };
  s3_config?: {
    enabled?: boolean;
    endpoint?: string;
    region?: string;
    bucket?: string;
    access_key?: string;
    secret_key?: string;
    path_style?: boolean;
    public_url?: string;
    media_delivery?: string;
    retention_days?: number;
  };
}

// Generate random string with specified length
function generateRandomId(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const createSessionSchema = z.object({
  name: z.string().min(1, "Session name is required").max(100).optional(),
  sessionName: z.string().min(1, "Session name is required").max(100).optional(),
  token: z.string().optional(),
  webhook: z.string().url().optional().or(z.literal("")),
  events: z.string().optional(),
  proxyConfig: z.object({
    enabled: z.boolean().optional(),
    proxyURL: z.string().optional(),
  }).optional(),
  s3Config: z.object({
    enabled: z.boolean().optional(),
    endpoint: z.string().optional(),
    region: z.string().optional(),
    bucket: z.string().optional(),
    accessKey: z.string().optional(),
    secretKey: z.string().optional(),
    pathStyle: z.boolean().optional(),
    publicURL: z.string().optional(),
    mediaDelivery: z.string().optional(),
    retentionDays: z.number().optional(),
  }).optional(),
}).refine((data) => data.name || data.sessionName, {
  message: "Either 'name' or 'sessionName' is required",
  path: ["name"],
});

// GET /api/customer/whatsapp/sessions - Get user's WhatsApp sessions
export async function GET(request: Request) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      ));
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check subscription status but don't block the request
    // Let the frontend SubscriptionGuard handle the subscription requirement
    const subscriptionStatus = await getWhatsAppSubscriptionStatus(userAuth.id);
    const hasSubscription = subscriptionStatus.hasActiveSubscription;
    
    // If no subscription, return empty data but with subscription info for frontend
    if (!hasSubscription) {
      return withCORS(NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
        subscription: {
          packageName: null,
          maxSessions: 0,
          currentSessions: 0,
          canCreateMoreSessions: false,
          endDate: null,
          hasActiveSubscription: false
        },
        message: "No active WhatsApp subscription found"
      }));
    }

    // Sync with external WhatsApp service first (like admin API)
    let externalSessions: ExternalSession[] = [];
    let syncedSessionsCount = 0;
    let recreatedSessionsCount = 0;
    
    if (WHATSAPP_SERVER_API && WHATSAPP_ADMIN_TOKEN) {
      try {
        // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Syncing with external service for user ${userAuth.id}...`);
        
        const response = await fetch(`${WHATSAPP_SERVER_API}/admin/users`, {
          method: 'GET',
          headers: {
            'Authorization': WHATSAPP_ADMIN_TOKEN,
          },
        });

        if (response.ok) {
          const data = await response.json();
          externalSessions = data.data || [];
          // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Found ${externalSessions.length} total external sessions`);

          // Get all sessions for this user from our database
          const dbSessions = await prisma.whatsAppSession.findMany({
            where: { userId: userAuth.id },
            select: {
              id: true,
              sessionId: true,
              sessionName: true,
              token: true,
              webhook: true,
              events: true,
              proxyEnabled: true,
              proxyUrl: true,
              s3Enabled: true,
              s3Endpoint: true,
              s3Region: true,
              s3Bucket: true,
              s3AccessKey: true,
              s3SecretKey: true,
              s3PathStyle: true,
              s3PublicUrl: true,
              s3MediaDelivery: true,
              s3RetentionDays: true,
            }
          });

          // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Found ${dbSessions.length} sessions in DB for user ${userAuth.id}`);

          // Find sessions that exist in DB but missing in external server
          const missingInExternal = dbSessions.filter(dbSession => {
            return !externalSessions.find(extSession => extSession.token === dbSession.token);
          });

          // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Found ${missingInExternal.length} sessions missing in external server`);

          // Only recreate missing sessions if user has subscription and won't exceed quota
          if (missingInExternal.length > 0 && hasSubscription) {
            // Calculate total sessions after sync (existing external + missing to recreate)
            const userExternalSessions = externalSessions.filter(extSession =>
              dbSessions.find(dbSession => dbSession.token === extSession.token)
            );
            const totalAfterSync = userExternalSessions.length + missingInExternal.length;

            // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Total sessions after sync would be: ${totalAfterSync}, max allowed: ${subscriptionStatus.maxSessions}`);

            // Check if recreating all missing sessions would exceed quota
            const maxSessions = subscriptionStatus.maxSessions;
            const sessionsToRecreate = maxSessions > 0 && totalAfterSync > maxSessions 
              ? missingInExternal.slice(0, maxSessions - userExternalSessions.length)
              : missingInExternal;

            // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Will recreate ${sessionsToRecreate.length} sessions (quota limited)`);

            // Recreate missing sessions in external server
            for (const dbSession of sessionsToRecreate) {
              try {
                // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Recreating session ${dbSession.sessionName} in external server...`);

                const createPayload = {
                  name: dbSession.sessionName,
                  token: dbSession.token,
                  webhook: dbSession.webhook || '',
                  events: dbSession.events || 'Message',
                  proxyConfig: {
                    enabled: dbSession.proxyEnabled || false,
                    proxyURL: dbSession.proxyUrl || ''
                  },
                  s3Config: {
                    enabled: dbSession.s3Enabled || false,
                    endpoint: dbSession.s3Endpoint || '',
                    region: dbSession.s3Region || '',
                    bucket: dbSession.s3Bucket || '',
                    accessKey: dbSession.s3AccessKey || '',
                    secretKey: dbSession.s3SecretKey || '',
                    pathStyle: dbSession.s3PathStyle || false,
                    publicURL: dbSession.s3PublicUrl || '',
                    mediaDelivery: dbSession.s3MediaDelivery || 'base64',
                    retentionDays: dbSession.s3RetentionDays || 30
                  }
                };

                const recreateResponse = await fetch(`${WHATSAPP_SERVER_API}/admin/users`, {
                  method: 'POST',
                  headers: {
                    'Authorization': WHATSAPP_ADMIN_TOKEN,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(createPayload)
                });

                if (recreateResponse.ok) {
                  const recreateData = await recreateResponse.json();
                  if (recreateData.success) {
                    recreatedSessionsCount++;
                    // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Successfully recreated session ${dbSession.sessionName}`);
                    
                    // Update DB with external service response data if needed
                    await prisma.whatsAppSession.update({
                      where: { id: dbSession.id },
                      data: {
                        sessionId: recreateData.data.id || dbSession.sessionId,
                        status: 'disconnected',
                        connected: false,
                        loggedIn: false,
                        updatedAt: new Date()
                      }
                    });
                  } else {
                    console.error(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Failed to recreate session ${dbSession.sessionName}:`, recreateData.error);
                  }
                } else {
                  console.error(`[CUSTOMER_WHATSAPP_SESSIONS_GET] External service error recreating session ${dbSession.sessionName}:`, recreateResponse.status);
                }
              } catch (recreateError) {
                console.error(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Error recreating session ${dbSession.sessionName}:`, recreateError);
              }
            }

            // Refresh external sessions list after recreation
            if (recreatedSessionsCount > 0) {
              try {
                const refreshResponse = await fetch(`${WHATSAPP_SERVER_API}/admin/users`, {
                  method: 'GET',
                  headers: {
                    'Authorization': WHATSAPP_ADMIN_TOKEN,
                  },
                });
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  externalSessions = refreshData.data || [];
                  // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Refreshed external sessions list: ${externalSessions.length} sessions`);
                }
              } catch (refreshError) {
                console.error(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Error refreshing external sessions:`, refreshError);
              }
            }
          } else if (missingInExternal.length > 0 && !hasSubscription) {
            // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] User has no active subscription - skipping session recreation`);
          } else if (missingInExternal.length > 0) {
            // console.log(`[CUSTOMER_WHATSAPP_SESSIONS_GET] Recreation would exceed quota - limited recreation applied`);
          }

          // Continue with normal sync process (update DB with external server data)
          for (const extSession of externalSessions) {
            // Check if this session belongs to current user
            const existingSession = await prisma.whatsAppSession.findFirst({
              where: { 
                token: extSession.token,
                userId: userAuth.id // Only sync sessions that belong to this user
              }
            });

            if (existingSession) {
              // Update existing session with latest data from external service
              await prisma.whatsAppSession.update({
                where: { id: existingSession.id },
                data: {
                  sessionId: extSession.id,
                  sessionName: extSession.name,
                  webhook: extSession.webhook || null,
                  events: extSession.events || null,
                  expiration: extSession.expiration || 0,
                  connected: extSession.connected || false,
                  loggedIn: extSession.loggedIn || false,
                  jid: extSession.jid || null,
                  qrcode: extSession.qrcode || null,
                  status: extSession.connected && extSession.loggedIn ? 'connected' : 
                          !extSession.connected ? 'disconnected' : 
                          !extSession.loggedIn ? 'qr_required' : 'unknown',
                  proxyEnabled: extSession.proxy_config?.enabled || false,
                  proxyUrl: extSession.proxy_config?.proxy_url || null,
                  s3Enabled: extSession.s3_config?.enabled || false,
                  s3Endpoint: extSession.s3_config?.endpoint || null,
                  s3Region: extSession.s3_config?.region || null,
                  s3Bucket: extSession.s3_config?.bucket || null,
                  s3AccessKey: extSession.s3_config?.access_key || null,
                  s3SecretKey: extSession.s3_config?.secret_key || null,
                  s3PathStyle: extSession.s3_config?.path_style || false,
                  s3PublicUrl: extSession.s3_config?.public_url || null,
                  s3MediaDelivery: extSession.s3_config?.media_delivery || 'base64',
                  s3RetentionDays: extSession.s3_config?.retention_days || 30,
                  updatedAt: new Date()
                }
              });
              syncedSessionsCount++;
            }
          }
        } else {
          console.error(`[CUSTOMER_WHATSAPP_SESSIONS_GET] External service error: ${response.status}`);
        }
      } catch (error) {
        console.error('[CUSTOMER_WHATSAPP_SESSIONS_GET] External service error:', error);
        // Continue with database query even if external service fails
      }
    }

    const whereClause: any = { userId: userAuth.id };
    
    if (status) {
      whereClause.status = status;
    }

    const [sessions, total] = await Promise.all([
      prisma.whatsAppSession.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          sessionId: true,
          sessionName: true,
          token: true,
          status: true,
          connected: true,
          loggedIn: true,
          jid: true,
          qrcode: true,
          message: true,
          webhook: true,
          events: true,
          createdAt: true,
          updatedAt: true,
          isSystemSession: true,
          proxyEnabled: true,
          proxyUrl: true,
          s3Enabled: true,
          s3Endpoint: true,
          s3Region: true,
          s3Bucket: true,
          s3AccessKey: true,
          s3PathStyle: true,
          s3PublicUrl: true,
          s3MediaDelivery: true,
          s3RetentionDays: true,
        },
      }),
      prisma.whatsAppSession.count({ where: whereClause }),
    ]);

    return withCORS(NextResponse.json({
      success: true,
      data: sessions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      subscription: {
        packageName: subscriptionStatus.packageName,
        maxSessions: subscriptionStatus.maxSessions,
        currentSessions: subscriptionStatus.currentSessions,
        canCreateMoreSessions: subscriptionStatus.canCreateMoreSessions,
        endDate: subscriptionStatus.endDate,
        hasActiveSubscription: true
      },
      syncInfo: {
        externalSessionsFound: externalSessions.length,
        syncedSessions: syncedSessionsCount,
        recreatedSessions: recreatedSessionsCount,
        syncedAt: new Date().toISOString()
      }
    }));
  } catch (error) {
    console.error("[CUSTOMER_WHATSAPP_SESSIONS_GET]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch WhatsApp sessions" },
      { status: 500 }
    ));
  }
}

// POST /api/customer/whatsapp/sessions - Create new WhatsApp session
export async function POST(request: Request) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      ));
    }

    // Check if user has active WhatsApp subscription
    const subscriptionStatus = await getWhatsAppSubscriptionStatus(userAuth.id);
    if (!subscriptionStatus.hasActiveSubscription) {
      return withCORS(NextResponse.json(
        { success: false, error: "Active WhatsApp subscription required" },
        { status: 403 }
      ));
    }

    // console.log('[WHATSAPP_SESSION_CREATE] Subscription status:', {
    //   packageName: subscriptionStatus.packageName,
    //   maxSessions: subscriptionStatus.maxSessions,
    //   currentSessions: subscriptionStatus.currentSessions,
    //   canCreateMore: subscriptionStatus.canCreateMoreSessions
    // });

    // Check if user can create more sessions
    if (!subscriptionStatus.canCreateMoreSessions) {
      return withCORS(NextResponse.json(
        { 
          success: false, 
          error: `Session limit reached. Your package "${subscriptionStatus.packageName}" allows maximum ${subscriptionStatus.maxSessions} sessions. You currently have ${subscriptionStatus.currentSessions} sessions.`,
          details: {
            packageName: subscriptionStatus.packageName,
            maxSessions: subscriptionStatus.maxSessions,
            currentSessions: subscriptionStatus.currentSessions
          }
        },
        { status: 403 }
      ));
    }

    const body = await request.json();
    const validation = createSessionSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { name, sessionName, token: providedToken, webhook, events, proxyConfig, s3Config } = validation.data;
    
    // Use provided name or sessionName, fallback to generated name
    const finalSessionName = name || sessionName || `Session-${generateRandomId(6)}`;
    
    // Use provided token or generate one
    const finalToken = providedToken || `token-${generateRandomId(16)}`;
    
    // Generate unique session ID with 10 random characters
    const sessionId = `customer-${userAuth.id}-${generateRandomId(10)}`;

    if (!WHATSAPP_SERVER_API || !WHATSAPP_ADMIN_TOKEN) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: 'WhatsApp service configuration missing' 
      }, { status: 500 }));
    }

    // Check if token already exists in database
    const existingSession = await prisma.whatsAppSession.findUnique({
      where: { token: finalToken }
    });

    if (existingSession) {
      return withCORS(NextResponse.json({ 
        success: false, 
        error: 'Session with this token already exists. Please use a different token.' 
      }, { status: 400 }));
    }

    // Create session in external WhatsApp Go service first
    // console.log(`[WHATSAPP_SESSION_CREATE] Creating session in external service: ${finalSessionName}`);
    
    const externalResponse = await fetch(`${WHATSAPP_SERVER_API}/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': WHATSAPP_ADMIN_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: finalSessionName,
        token: finalToken,
        webhook: webhook || '',
        events: events || 'All',
        proxyConfig: proxyConfig || {
          enabled: false,
          proxyURL: ''
        },
        s3Config: s3Config || {
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
      })
    });

    if (!externalResponse.ok) {
      const errorData = await externalResponse.json().catch(() => ({}));
      console.error(`[WHATSAPP_SESSION_CREATE] External service error:`, errorData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorData.details || `WhatsApp service error: ${externalResponse.status}` 
      }, { status: 500 }));
    }

    const externalData = await externalResponse.json();
    
    if (!externalData.success) {
      console.error(`[WHATSAPP_SESSION_CREATE] External service returned error:`, externalData);
      return withCORS(NextResponse.json({ 
        success: false, 
        error: externalData.details || 'WhatsApp service returned error' 
      }, { status: 500 }));
    }

    // console.log(`[WHATSAPP_SESSION_CREATE] External session created successfully:`, externalData.data);

    // Create new session in database with external service data
    const session = await prisma.whatsAppSession.create({
      data: {
        sessionId: externalData.data.id || sessionId, // Use external ID if provided
        sessionName: finalSessionName,
        token: finalToken,
        userId: userAuth.id,
        status: 'disconnected',
        webhook: webhook || null,
        events: events || 'All',
        expiration: externalData.data.expiration || 0,
        connected: false,
        loggedIn: false,
        jid: null,
        qrcode: null,
        proxyEnabled: proxyConfig?.enabled || false,
        proxyUrl: proxyConfig?.proxyURL || null,
        s3Enabled: s3Config?.enabled || false,
        s3Endpoint: s3Config?.endpoint || null,
        s3Region: s3Config?.region || null,
        s3Bucket: s3Config?.bucket || null,
        s3AccessKey: s3Config?.accessKey || null,
        s3SecretKey: s3Config?.secretKey || null,
        s3PathStyle: s3Config?.pathStyle || false,
        s3PublicUrl: s3Config?.publicURL || null,
        s3MediaDelivery: s3Config?.mediaDelivery || 'base64',
        s3RetentionDays: s3Config?.retentionDays || 30,
      },
      select: {
        id: true,
        sessionId: true,
        sessionName: true,
        token: true,
        status: true,
        connected: true,
        loggedIn: true,
        jid: true,
        qrcode: true,
        message: true,
        webhook: true,
        events: true,
        createdAt: true,
        updatedAt: true,
        isSystemSession: true,
        proxyEnabled: true,
        proxyUrl: true,
        s3Enabled: true,
        s3Endpoint: true,
        s3Region: true,
        s3Bucket: true,
        s3AccessKey: true,
        s3PathStyle: true,
        s3PublicUrl: true,
        s3MediaDelivery: true,
        s3RetentionDays: true,
      },
    });

    return withCORS(NextResponse.json({
      success: true,
      data: session,
      message: "WhatsApp session created successfully",
    }));
  } catch (error) {
    console.error("[CUSTOMER_WHATSAPP_SESSIONS_POST]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to create WhatsApp session" },
      { status: 500 }
    ));
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return corsOptionsResponse();
}
