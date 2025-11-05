# WhatsApp Auto-Recovery System Documentation

## Overview

Sistem auto-recovery WhatsApp telah diimplementasikan untuk memastikan pesan-pesan sistem kritis (seperti OTP SSO, notifikasi transaksi, notifikasi pembayaran) dapat terkirim dengan reliable meskipun terjadi gangguan pada server WhatsApp.

## Key Features

### 1. Automatic Session Status Checking
- Menggunakan endpoint `/session/status` dengan token header untuk cek status session
- Mengecek `connected` dan `loggedIn` flags dari response
- Session dianggap aktif jika **kedua** flag bernilai `true`

### 2. Automatic Session Reconnection
- Jika session disconnected, sistem otomatis melakukan reconnect menggunakan endpoint `/session/connect`
- Menunggu 2 detik setelah reconnect attempt untuk stabilisasi koneksi
- Mengecek ulang status session setelah reconnect

### 3. Phone Number Normalization
- Format Indonesian: `08xxx` → `628xxx` (otomatis)
- Format International: tetap dipertahankan dengan country code
- Centralized di `@/lib/auth.ts` dengan function `normalizePhoneNumber()` dan `normalizePhoneForWhatsApp()`

## Implementation Details

### Core Service: `whatsappGoService`

Located: `src/services/whatsapp-go.ts`

#### Key Methods:

```typescript
// Get system session status
async getSystemSessionStatus(): Promise<WhatsAppGoResult>

// Connect system session 
async connectSystemSession(): Promise<WhatsAppGoResult>

// Send system message with auto-recovery
async sendSystemMessage(phoneNumber: string, message: string): Promise<WhatsAppGoResult>
```

#### Auto-Recovery Flow:

1. **First Attempt**: Coba kirim pesan normally
2. **On Failure**: Check session status via `/session/status`
3. **If Disconnected**: 
   - Call `/session/connect` untuk reconnect
   - Wait 2 seconds untuk stabilisasi
   - Check status lagi
   - Jika berhasil connect, retry kirim pesan
4. **Return Result**: Success atau failure dengan error details

### Updated APIs Using Auto-Recovery

#### 1. SSO Authentication
- **File**: `src/app/api/auth/sso-signin/route.ts`
- **Usage**: `whatsappGoService.sendSystemMessage()` untuk OTP login
- **Benefit**: Rate limiting hanya diaktifkan setelah pesan berhasil terkirim

#### 2. User Registration  
- **File**: `src/app/api/auth/signup/route.ts`
- **Usage**: `whatsappGoService.sendSystemMessage()` untuk OTP verifikasi
- **Benefit**: User tidak jadi terdaftar jika OTP gagal kirim, tapi auto-recovery dicoba dulu

#### 3. OTP Services
- **File**: `src/app/api/auth/send-otp/route.ts`
- **File**: `src/app/api/auth/send-password-reset-otp/route.ts`
- **Usage**: Auto-recovery untuk verification OTP dan password reset OTP

#### 4. Payment Notifications
- **File**: `src/services/payment-notification.ts`
- **Usage**: Critical payment notifications dengan auto-recovery
- **Types**: Payment created, payment success, payment status updates, payment expiry warnings

## Configuration

### Environment Variables Required

```env
WHATSAPP_SERVER_API="https://wa.genfity.com"
WHATSAPP_USER_TOKEN="genfityuserwa"
```

### Endpoint Details

#### Session Status Check
```
GET {WHATSAPP_SERVER_API}/session/status
Headers: 
  token: {WHATSAPP_USER_TOKEN}
  Content-Type: application/json
```

#### Session Connect
```
POST {WHATSAPP_SERVER_API}/session/connect
Headers:
  token: {WHATSAPP_USER_TOKEN}
  Content-Type: application/json
Body:
{
  "Subscribe": ["Message", "ReadReceipt"],
  "Immediate": true
}
```

#### Send Message
```
POST {WHATSAPP_SERVER_API}/chat/send/text
Headers:
  token: {WHATSAPP_USER_TOKEN}
  Content-Type: application/json
Body:
{
  "Phone": "628123456789",
  "Body": "Your message here"
}
```

## Admin Monitoring

### WhatsApp Sessions Dashboard
- **URL**: `/admin/dashboard/whatsapp-sessions`
- **Features**: 
  - View all WhatsApp sessions (system and customer)
  - Check session connection status
  - Manual connect/disconnect sessions
  - View QR codes for authentication
  - Real-time session status monitoring
- **Usage**: Comprehensive WhatsApp management interface untuk admin

## Error Handling

### Rate Limiting Strategy
- **SSO/OTP**: Rate limiting **HANYA** diaktifkan setelah pesan berhasil terkirim
- **Signup**: User tidak terdaftar jika OTP gagal kirim (rollback transaction)
- **Payment**: Auto-recovery memastikan notifikasi penting tetap terkirim

### Logging
- Semua auto-recovery attempts di-log dengan prefix `[WhatsApp System]`
- Success dan failure di-track untuk monitoring
- Error details disimpan untuk debugging

### Fallback Behavior
- Jika auto-recovery gagal sepenuhnya, sistem return error yang informatif
- User dapat mencoba lagi karena rate limiting tidak diaktifkan untuk failed attempts
- Critical system messages tetap mencoba auto-recovery

## Phone Number Format Examples

| Input | Normalized Output | WhatsApp Format |
|-------|-------------------|-----------------|
| `08123456789` | `628123456789` | `628123456789` |
| `+628123456789` | `628123456789` | `628123456789` |
| `628123456789` | `628123456789` | `628123456789` |
| `8123456789` | `628123456789` | `628123456789` |
| `+15551234567` | `15551234567` | `15551234567` |

## Testing Guide

### 1. Test Normal Flow
```bash
# Test SSO login with auto-recovery
curl -X POST http://localhost:8090/api/auth/sso-signin \
  -H "Content-Type: application/json" \
  -d '{"identifier": "08123456789", "method": "whatsapp"}'
```

### 2. Test Admin Dashboard
- Navigate to `/admin/dashboard/whatsapp-sessions`
- Check system WhatsApp session status
- Verify session connection health
- Test manual connect if needed

### 3. Simulate WhatsApp Server Issues
1. Temporarily modify WhatsApp server URL to trigger failures
2. Observe auto-recovery attempts in logs
3. Verify session reconnection works correctly

## Benefits

1. **Reliability**: Critical messages lebih reliabel dengan auto-recovery
2. **User Experience**: Reduced failed OTP/notification issues
3. **Monitoring**: Clear visibility untuk admin tentang WhatsApp system health
4. **Consistency**: Centralized phone normalization across entire system
5. **Rate Limiting**: Smart rate limiting yang tidak mempenalti server issues

## Future Enhancements

1. **Retry Queue**: Implement background job untuk retry failed messages
2. **Multiple Sessions**: Support multiple WhatsApp sessions untuk load balancing
3. **Metrics**: Detailed metrics collection untuk success/failure rates
4. **Alerting**: Real-time alerts ketika auto-recovery gagal berulang kali