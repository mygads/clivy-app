/**
 * WhatsApp Go Server Integration
 * Server menggunakan whatsapp-go yang menggantikan whatsapp-web-js
 */

interface WhatsAppGoResult {
    success: boolean;
    error?: {
        type: 'NETWORK_ERROR' | 'TIMEOUT' | 'AUTH_ERROR' | 'SERVER_ERROR' | 'CONFIG_ERROR';
        message: string;
        statusCode?: number;
    };
    data?: any;
}

interface WhatsAppUser {
    connected: boolean;
    events: string;
    expiration: number;
    id: string;
    jid: string;
    loggedIn: boolean;
    name: string;
    proxy_config: {
        enabled: boolean;
        proxy_url: string;
    };
    proxy_url: string;
    qrcode: string;
    s3_config: {
        access_key: string;
        bucket: string;
        enabled: boolean;
        endpoint: string;
        media_delivery: string;
        path_style: boolean;
        public_url: string;
        region: string;
        retention_days: number;
    };
    token: string;
    webhook: string;
}

interface WhatsAppUsersResponse {
    code: number;
    data: WhatsAppUser[];
    success: boolean;
}

class WhatsAppGoService {
    private baseUrl: string;
    private adminToken: string;
    private userToken: string;

    constructor() {
        this.baseUrl = process.env.WHATSAPP_SERVER_API || 'https://wa.genfity.com';
        this.adminToken = process.env.WHATSAPP_ADMIN_TOKEN || '';
        this.userToken = process.env.WHATSAPP_USER_TOKEN || '';
    }

    /**
     * Get headers for admin requests
     */
    private getAdminHeaders(): Headers {
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        headers.set('Authorization', this.adminToken);
        return headers;
    }

    /**
     * Get headers for user requests (non-admin routes)
     */
    private getUserHeaders(): Headers {
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        headers.set('token', this.userToken);
        return headers;
    }

    /**
     * Make HTTP request with error handling
     */
    private async makeRequest(
        url: string, 
        options: RequestInit, 
        timeout: number = 30000
    ): Promise<WhatsAppGoResult> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorData = { message: response.statusText };
                try {
                    errorData = await response.json();
                } catch (e) { /* ignore if parsing fails */ }

                let errorType: 'NETWORK_ERROR' | 'TIMEOUT' | 'AUTH_ERROR' | 'SERVER_ERROR' | 'CONFIG_ERROR' = 'SERVER_ERROR';
                if (response.status === 401 || response.status === 403) {
                    errorType = 'AUTH_ERROR';
                } else if (response.status >= 500) {
                    errorType = 'SERVER_ERROR';
                }

                return {
                    success: false,
                    error: {
                        type: errorType,
                        message: errorData.message || `HTTP ${response.status}`,
                        statusCode: response.status
                    }
                };
            }

            const data = await response.json();
            return { success: true, data };

        } catch (error) {
            console.error('WhatsApp Go API Error:', error);

            let errorType: 'NETWORK_ERROR' | 'TIMEOUT' | 'AUTH_ERROR' | 'SERVER_ERROR' | 'CONFIG_ERROR' = 'NETWORK_ERROR';
            let errorMessage = 'Network error occurred';

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorType = 'TIMEOUT';
                    errorMessage = 'Request timeout after 30 seconds';
                } else if (error.message.includes('fetch') || error.message.includes('ENOTFOUND')) {
                    errorType = 'NETWORK_ERROR';
                    errorMessage = 'Unable to connect to WhatsApp server';
                }
            }

            return {
                success: false,
                error: {
                    type: errorType,
                    message: errorMessage
                }
            };
        }
    }

    /**
     * Get list of WhatsApp users (Admin only)
     */
    async getUsers(): Promise<WhatsAppGoResult> {
        if (!this.adminToken) {
            return {
                success: false,
                error: {
                    type: 'CONFIG_ERROR',
                    message: 'WhatsApp admin token not configured'
                }
            };
        }

        const url = `${this.baseUrl}/admin/users`;
        return this.makeRequest(url, {
            method: 'GET',
            headers: this.getAdminHeaders()
        });
    }

    /**
     * Create new WhatsApp user (Admin only)
     */
    async createUser(userData: {
        name: string;
        token: string;
        webhook?: string;
        events?: string;
        proxyConfig?: {
            enabled: boolean;
            proxyURL: string;
        };
        s3Config?: {
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
    }): Promise<WhatsAppGoResult> {
        if (!this.adminToken) {
            return {
                success: false,
                error: {
                    type: 'CONFIG_ERROR',
                    message: 'WhatsApp admin token not configured'
                }
            };
        }

        const url = `${this.baseUrl}/admin/users`;
        return this.makeRequest(url, {
            method: 'POST',
            headers: this.getAdminHeaders(),
            body: JSON.stringify(userData)
        });
    }

    /**
     * Delete WhatsApp user (Admin only)
     */
    async deleteUser(userId: string): Promise<WhatsAppGoResult> {
        if (!this.adminToken) {
            return {
                success: false,
                error: {
                    type: 'CONFIG_ERROR',
                    message: 'WhatsApp admin token not configured'
                }
            };
        }

        const url = `${this.baseUrl}/admin/users/${userId}`;
        return this.makeRequest(url, {
            method: 'DELETE',
            headers: this.getAdminHeaders()
        });
    }

    /**
     * Send text message using user token
     */
    async sendTextMessage(phoneNumber: string, message: string): Promise<WhatsAppGoResult> {
        if (!this.userToken) {
            return {
                success: false,
                error: {
                    type: 'CONFIG_ERROR',
                    message: 'WhatsApp user token not configured'
                }
            };
        }

        // Use the centralized phone normalization function for consistency
        // This ensures 08xxx becomes 628xxx and handles international numbers properly
        const formattedPhone = this.normalizePhoneForWhatsApp(phoneNumber);

        const url = `${this.baseUrl}/chat/send/text`;
        return this.makeRequest(url, {
            method: 'POST',
            headers: this.getUserHeaders(),
            body: JSON.stringify({
                Phone: formattedPhone,
                Body: message
            })
        });
    }

    /**
     * Send system message with auto-recovery mechanism
     * Used for critical system messages like SSO OTP, transaction notifications
     */
    async sendSystemMessage(phoneNumber: string, message: string): Promise<WhatsAppGoResult> {
        if (!this.userToken) {
            return {
                success: false,
                error: {
                    type: 'CONFIG_ERROR',
                    message: 'WhatsApp user token not configured'
                }
            };
        }

        // console.log(`[WhatsApp System] Attempting to send message to ${phoneNumber}`);
        
        // First attempt to send message
        let result = await this.sendTextMessage(phoneNumber, message);
        
        // If failed, try auto-recovery mechanism
        if (!result.success && result.error) {
            console.log(`[WhatsApp System] Initial send failed: ${result.error.message}`);
            console.log(`[WhatsApp System] Checking session status for auto-recovery...`);
            
            // Check system session status
            const sessionStatus = await this.getSystemSessionStatus();
            
            if (sessionStatus.success && sessionStatus.data) {
                // Check both connected and loggedIn flags from session status
                const sessionData = sessionStatus.data.data || sessionStatus.data;
                const isConnected = sessionData.connected === true;
                const isLoggedIn = sessionData.loggedIn === true;
                const isSessionActive = isConnected && isLoggedIn;
                
                console.log(`[WhatsApp System] Session status - Connected: ${isConnected}, LoggedIn: ${isLoggedIn}`);
                
                if (!isSessionActive) {
                    console.log(`[WhatsApp System] Session disconnected (Connected: ${isConnected}, LoggedIn: ${isLoggedIn}), attempting to reconnect...`);
                    
                    // Try to reconnect
                    const reconnectResult = await this.connectSystemSession();
                    
                    if (reconnectResult.success) {
                        console.log(`[WhatsApp System] Reconnection initiated, checking status again...`);
                        
                        // Wait a bit for connection to establish
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        // Check status again
                        const statusAfterConnect = await this.getSystemSessionStatus();
                        
                        if (statusAfterConnect.success && statusAfterConnect.data) {
                            // Check session status after reconnect attempt
                            const afterConnectData = statusAfterConnect.data.data || statusAfterConnect.data;
                            const nowConnected = afterConnectData.connected === true;
                            const nowLoggedIn = afterConnectData.loggedIn === true;
                            const isNowActive = nowConnected && nowLoggedIn;
                            
                            console.log(`[WhatsApp System] After reconnect - Connected: ${nowConnected}, LoggedIn: ${nowLoggedIn}`);
                            
                            if (isNowActive) {
                                console.log(`[WhatsApp System] Session reconnected, retrying message send...`);
                                
                                // Retry sending message
                                result = await this.sendTextMessage(phoneNumber, message);
                                
                                if (result.success) {
                                    console.log(`[WhatsApp System] Message sent successfully after recovery`);
                                } else {
                                    console.log(`[WhatsApp System] Message still failed after recovery: ${result.error?.message}`);
                                }
                            } else {
                                console.log(`[WhatsApp System] Session still disconnected after reconnect attempt`);
                                result = {
                                    success: false,
                                    error: {
                                        type: 'SERVER_ERROR',
                                        message: 'WhatsApp session could not be restored'
                                    }
                                };
                            }
                        } else {
                            console.log(`[WhatsApp System] Failed to check session status after reconnect`);
                        }
                    } else {
                        console.log(`[WhatsApp System] Failed to reconnect session: ${reconnectResult.error?.message}`);
                        result = {
                            success: false,
                            error: {
                                type: 'SERVER_ERROR',
                                message: 'WhatsApp session reconnection failed'
                            }
                        };
                    }
                } else {
                    console.log(`[WhatsApp System] Session is connected but message still failed`);
                }
            } else {
                console.log(`[WhatsApp System] Failed to check session status: ${sessionStatus.error?.message}`);
            }
        } else if (result.success) {
            // console.log(`[WhatsApp System] Message sent successfully on first attempt`);
        }
        
        return result;
    }

    /**
     * Check if service is configured properly
     */
    isConfigured(): boolean {
        return !!(this.baseUrl && this.userToken);
    }

    /**
     * Check if admin functions are available
     */
    isAdminConfigured(): boolean {
        return !!(this.baseUrl && this.adminToken);
    }

    /**
     * Get system session status (for genfity system WhatsApp)
     * Uses /session/status endpoint as specified by user requirements
     */
    async getSystemSessionStatus(): Promise<WhatsAppGoResult> {
        if (!this.userToken) {
            return {
                success: false,
                error: {
                    type: 'CONFIG_ERROR',
                    message: 'WhatsApp user token not configured'
                }
            };
        }

        const url = `${this.baseUrl}/session/status`;
        return this.makeRequest(url, {
            method: 'GET',
            headers: {
                'token': this.userToken, // Use token header as specified
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Connect system session
     * Uses /session/connect endpoint with token header as per user requirements
     */
    async connectSystemSession(): Promise<WhatsAppGoResult> {
        if (!this.userToken) {
            return {
                success: false,
                error: {
                    type: 'CONFIG_ERROR',
                    message: 'WhatsApp user token not configured'
                }
            };
        }

        const url = `${this.baseUrl}/session/connect`;
        return this.makeRequest(url, {
            method: 'POST',
            headers: {
                'token': this.userToken, // Use token header as specified
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Subscribe: ["Message", "ReadReceipt"], // Default system events
                Immediate: true // Connect immediately
            })
        });
    }

    /**
     * Normalize phone number for WhatsApp (uses centralized function from auth.ts)
     * Ensures Indonesian numbers 08xxx become 628xxx automatically
     */
    private normalizePhoneForWhatsApp(phoneNumber: string): string {
        // Use centralized normalization function but return without + for API consistency
        const { normalizePhoneNumber } = require('@/lib/auth');
        return normalizePhoneNumber(phoneNumber);
    }
}

// Export singleton instance
export const whatsappGoService = new WhatsAppGoService();

// Backward compatibility functions
export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
    const result = await sendWhatsAppMessageDetailed(phoneNumber, message);
    return result.success;
}

export async function sendWhatsAppMessageDetailed(phoneNumber: string, message: string, useAutoRecovery: boolean = true): Promise<WhatsAppGoResult> {
    // console.log(`[WhatsApp Go] Sending message to ${phoneNumber}: ${message.substring(0, 50)}...`);
    
    if (!whatsappGoService.isConfigured()) {
        console.error('[WhatsApp Go] Service not configured properly');
        return {
            success: false,
            error: {
                type: 'CONFIG_ERROR',
                message: 'WhatsApp service not configured'
            }
        };
    }

    // Use sendSystemMessage for critical system messages (with auto-recovery)
    // Use regular sendTextMessage for non-critical messages
    const result = useAutoRecovery 
        ? await whatsappGoService.sendSystemMessage(phoneNumber, message)
        : await whatsappGoService.sendTextMessage(phoneNumber, message);
    
    if (result.success) {
        // console.log(`[WhatsApp Go] Message sent successfully to ${phoneNumber}`);
    } else {
        console.error(`[WhatsApp Go] Failed to send message to ${phoneNumber}:`, result.error);
    }
    
    return result;
}

// Export service class for advanced usage
export { WhatsAppGoService };
export default whatsappGoService;
