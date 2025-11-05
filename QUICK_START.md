# 🚀 QUICK START GUIDE - WhatsApp API Service App

## What Changed?
**The app is now simplified to ONLY sell WhatsApp API services.**
- ❌ No more Products/Packages/Add-ons
- ✅ Only WhatsApp API monthly/yearly subscriptions
- ✅ Simpler, faster, easier to maintain

---

## Application Flow

### Customer Journey
```
1. Landing Page
   ↓ View WhatsApp pricing plans
   
2. Add to Cart
   ↓ Select monthly or yearly billing
   
3. Checkout
   ↓ Enter contact info + OTP verification
   
4. Payment
   ↓ Choose Duitku or Manual Transfer
   
5. Auto-Activation
   ↓ WhatsApp subscription activated automatically
   
6. Dashboard
   ↓ View active subscription, manage account
```

### Admin Journey
```
1. Admin Login
   ↓ Access admin dashboard
   
2. Monitor Transactions
   ↓ View all WhatsApp purchases
   
3. Manage Payments
   ↓ Approve manual transfers, check Duitku payments
   
4. Manage Subscriptions
   ↓ View active WhatsApp subscriptions
   
5. Analytics
   ↓ Track revenue, users, subscriptions
```

---

## Key Files to Know

### Frontend Pages
| File | Purpose |
|------|---------|
| `src/app/[locale]/page.tsx` | Landing page with WhatsApp pricing |
| `src/app/[locale]/checkout/page.tsx` | Checkout flow (4 steps) |
| `src/app/[locale]/dashboard/transaction/page.tsx` | Customer transaction list |
| `src/app/[locale]/admin/dashboard/transaction/page.tsx` | Admin transaction management |
| `src/app/[locale]/dashboard/whatsapp-service/page.tsx` | Active WhatsApp subscriptions |

### API Endpoints
| File | Purpose |
|------|---------|
| `src/app/api/customer/checkout/route.ts` | Create WhatsApp purchase transaction |
| `src/app/api/customer/payment/create/route.ts` | Create payment for transaction |
| `src/app/api/public/duitku/callback/route.ts` | Handle Duitku payment callback |
| `src/app/api/customer/transactions/[transactionId]/status/route.ts` | Get transaction status |

### Core Logic
| File | Purpose |
|------|---------|
| `src/lib/transaction-status-manager.ts` | Handle transaction state & WhatsApp activation |
| `src/lib/payment-expiration.ts` | Handle payment expiration & auto-activation |
| `src/components/Cart/CartContext.tsx` | Shopping cart state management |
| `prisma/schema.prisma` | Database schema (WhatsApp-only now) |

### Types
| File | Purpose |
|------|---------|
| `src/types/checkout.ts` | Checkout, payment, transaction types |
| `src/components/Cart/CartContext.tsx` | CartItem type definition |

---

## Common Tasks

### 1. Add New WhatsApp Package
**Location:** Admin Dashboard → WhatsApp Packages

**Or via Prisma:**
```typescript
await prisma.whatsAppPackage.create({
  data: {
    name: "Enterprise",
    description: "For large businesses",
    priceMonth_idr: 500000,
    priceMonth_usd: 35,
    priceYear_idr: 5000000,
    priceYear_usd: 350,
    maxSession: 10,
    yearlyDiscount: 16.67,
    recommended: false,
    features: ["100 contacts", "Unlimited messages", "Priority support"]
  }
})
```

### 2. Update Payment Method
**File:** `config/duitku-config.js`

Add/remove payment methods, update fees.

### 3. Modify Voucher Rules
**Location:** Admin Dashboard → Vouchers

Create voucher applicable to WhatsApp services.

### 4. Check Transaction Status
**API:** `GET /api/customer/transactions/:transactionId/status`

Returns:
- Transaction status
- Payment status
- WhatsApp activation status

### 5. Manually Activate WhatsApp
**Location:** Admin Dashboard → Transactions → View Detail → Activate

Or programmatically:
```typescript
import { TransactionStatusManager } from '@/lib/transaction-status-manager'

await TransactionStatusManager.updateTransactionStatus(
  transactionId,
  'in-progress',
  'success'
)
```

---

## Database Schema (Simplified)

### Core Tables
- `User` - Customer & admin accounts
- `WhatsAppPackage` - Available WhatsApp plans
- `Transaction` - Purchase transactions
- `WhatsAppTransaction` - WhatsApp-specific transaction details
- `WhatsAppServiceCustomer` - Active WhatsApp subscriptions
- `Payment` - Payment records
- `PaymentMethod` - Available payment methods
- `Voucher` - Discount vouchers

### Removed Tables (DROPPED after migration)
- ~~Package~~
- ~~Addon~~
- ~~Category~~
- ~~Subcategory~~
- ~~Feature~~
- ~~TransactionProduct~~
- ~~TransactionAddons~~
- ~~ServicesProductCustomers~~
- ~~ServicesAddonsCustomers~~

---

## Environment Variables

### Required
```env
# Database
DATABASE_URL="postgresql://..."

# Duitku Payment Gateway
DUITKU_MERCHANT_CODE="..."
DUITKU_API_KEY="..."
DUITKU_MODE="sandbox" # or "production"
DUITKU_CALLBACK_URL="https://your-domain.com/api/public/duitku/callback"
DUITKU_RETURN_URL="https://your-domain.com/payment-status"

# JWT
JWT_SECRET_KEY="..."

# Email (for OTP)
EMAIL_USER="..."
EMAIL_PASS="..."

# Next.js
NEXT_PUBLIC_API_URL="https://your-domain.com"
```

---

## Development Commands

### Start Development Server
```bash
pnpm dev
# Runs on http://localhost:8090
```

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start:8090
```

### Database Commands
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Deploy migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

---

## Testing Checklist

### Before Deployment
- [ ] WhatsApp packages display on landing page
- [ ] Add to cart works (monthly/yearly)
- [ ] Checkout flow completes (all 4 steps)
- [ ] OTP verification works
- [ ] Payment creation works (Duitku & Manual)
- [ ] Payment callback activates WhatsApp
- [ ] Customer can see active subscription
- [ ] Admin can view transactions
- [ ] Voucher applies discount correctly

### After Deployment
- [ ] Test complete purchase flow
- [ ] Verify Duitku callback works
- [ ] Check manual transfer approval
- [ ] Test WhatsApp auto-activation
- [ ] Monitor error logs
- [ ] Check database for correct data

---

## Troubleshooting

### WhatsApp Not Activating
**Check:**
1. Transaction status = "in-progress"
2. Payment status = "paid"
3. WhatsAppTransaction record exists
4. Check logs in `payment-expiration.ts`

**Fix:**
```typescript
// Manually trigger activation
await PaymentExpirationService.autoActivateServices(transaction)
```

### Payment Callback Failed
**Check:**
1. Duitku callback URL correct
2. API key and merchant code valid
3. Signature verification passes
4. Check logs in `duitku/callback/route.ts`

### Checkout Fails
**Check:**
1. Cart has WhatsApp items
2. User is authenticated
3. OTP verified
4. WhatsApp package exists in database

---

## Migration Checklist

### Pre-Migration
- [x] Code deployed to production
- [ ] Database backup created
- [ ] Staging tested
- [ ] Users notified (if needed)

### Migration Steps
```bash
# 1. BACKUP DATABASE (CRITICAL!)
pg_dump database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Deploy code
git push origin main

# 3. Run migration
npx prisma migrate deploy

# 4. Verify migration
npx prisma db pull
# Check schema matches expectations

# 5. Test production
# Complete a test purchase
```

### Post-Migration
- [ ] Test complete purchase flow
- [ ] Verify no errors in logs
- [ ] Check payment callbacks working
- [ ] Monitor WhatsApp activation
- [ ] Confirm data integrity

---

## Performance Tips

### Frontend
- WhatsApp packages cached client-side
- Cart state in localStorage
- Lazy load payment methods
- Optimize images with Next.js Image

### Backend
- Use Prisma connection pooling
- Index frequently queried fields
- Cache WhatsApp packages
- Batch update operations

### Database
```sql
-- Add indexes for common queries
CREATE INDEX idx_transaction_user ON "Transaction"("userId");
CREATE INDEX idx_transaction_status ON "Transaction"("status");
CREATE INDEX idx_payment_transaction ON "Payment"("transactionId");
CREATE INDEX idx_whatsapp_service_customer ON "WhatsAppServiceCustomer"("customerId");
```

---

## Security Considerations

### Payment Security
- ✅ Duitku signature verification
- ✅ HTTPS only
- ✅ API key in environment variables
- ✅ Transaction IDs are UUIDs

### User Authentication
- ✅ JWT with expiration
- ✅ OTP verification
- ✅ Password hashing (bcrypt)
- ✅ Session timeout

### API Security
- ✅ Rate limiting (recommended)
- ✅ CORS configured
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Prisma)

---

## Support & Resources

### Documentation
- `SIMPLIFICATION_PROGRESS.md` - Detailed changelog
- `SIMPLIFICATION_SUMMARY.md` - Project summary
- `COMMIT_MESSAGE.txt` - Git commit message

### Monitoring
- Check logs: `/var/log/app.log` (if configured)
- Database: Prisma Studio (`npx prisma studio`)
- Payments: Duitku dashboard
- Errors: Sentry (if configured)

### Getting Help
1. Check documentation files
2. Review error logs
3. Test in staging first
4. Rollback if needed (git revert)

---

**Last Updated:** November 6, 2025  
**App Version:** 2.0 (WhatsApp-Only)  
**Status:** ✅ Production Ready (after migration)
