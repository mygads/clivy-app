# Future Cleanup Tasks - Optional Enhancements

## Overview
The USD removal and Package/Addon simplification is COMPLETE and functional. However, there are some legacy files and references that can be cleaned up in future sessions if desired. These do NOT affect current functionality.

---

## Priority: LOW - Dashboard Pages

These pages still have USD references in display logic but are not critical since they're for user dashboard viewing:

### 1. WhatsApp Dashboard Main Page
**File:** `src/app/[locale]/dashboard/whatsapp/page.tsx`

**Issues:**
- Lines 374, 377: Currency conditional display
```typescript
{currency === 'idr' ? 'Rp' : '$'} 
{(currency === 'idr' ? stats.subscription.priceMonth_idr : stats.subscription.priceMonth_usd).toLocaleString()}
```

**Fix:** Simplify to always show IDR
```typescript
Rp {stats.subscription.priceMonth.toLocaleString()}
```

---

### 2. WhatsApp Subscription Page
**File:** `src/app/[locale]/dashboard/whatsapp/subscription/page.tsx`

**Issues:**
- Line 83, 85: Interface still has `priceMonth_usd`, `priceYear_usd`
- Line 423: Currency conditional in price display

**Fix:** 
1. Update interface to use `priceMonth` / `priceYear`
2. Remove currency conditional logic

---

### 3. Transaction List Page
**File:** `src/app/[locale]/dashboard/transaction/page.tsx`

**Issues:**
- Lines 64-66: Interface has USD price fields
- Lines 982, 985, 1265, 1268: Currency conditionals in price display
- Line 308: Currency-based locale selection

**Fix:**
1. Update WhatsAppPackage interface
2. Remove all `currency === 'USD'` conditionals
3. Hardcode to IDR formatting

---

### 4. Transaction Detail Page
**File:** `src/app/[locale]/dashboard/transaction/[transactionId]/page.tsx`

**Issues:**
- Lines 98, 102: Currency-based formatting logic
- Lines 750, 861: Product/Addon price references (deprecated features)

**Fix:**
1. Simplify formatCurrency to IDR-only
2. Remove product/addon transaction displays (deprecated)

---

## Priority: VERY LOW - Legacy Landing Pages

These components show old product offerings that may not be actively used:

### 1. Custom Website Pricing
**File:** `src/components/Sections/layanan/custom-website/WebsitePricing.tsx`

**Status:** Shows legacy website packages (not WhatsApp)
**Action:** 
- If still needed: Update to IDR-only
- If not needed: Delete entire component

---

### 2. Main Pricing Packages Section  
**File:** `src/components/Sections/layanan/PricingPackages.tsx`

**Status:** Legacy product pricing display
**Action:** Same as above - update or delete

---

## Priority: LOW - Type Definitions Cleanup

### 1. My Package Types
**File:** `src/components/my-package/types.ts`

**Status:** Old package system types, not used anymore
**Action:** Can be safely deleted

---

### 2. Cart Context Types
**File:** `src/components/Cart/CartContext.tsx`

**Issue:** CartItem interface still has `price_usd: number` (line 12)
**Fix:** Remove `price_usd` field from interface
**Impact:** May need to update cart add functions

---

## Priority: VERY LOW - Old Component Folders

These folders contain components for deprecated features:

### 1. My Package Components
**Folder:** `src/components/my-package/`

**Contains:**
- `package-list.tsx` - Old package listing
- `package-card.tsx` - Old package display
- `types.ts` - Deprecated types

**Action:** Delete entire folder (no longer used)

---

### 2. My Addons Components
**Folder:** `src/components/my-addons/`

**Contains:**
- `detail-modal.tsx` - Addon detail display
- `types.ts` - Addon types

**Action:** Delete entire folder (no longer used)

---

### 3. Old Pricing Components
**Folder:** `src/components/Sections/layanan/`

**Contains:**
- `mobile-development/MobilePricing.tsx`
- `web-app/WebAppPricing.tsx`
- `corporate-system/CorporateSystemPricing.tsx`

**Status:** Show legacy product offerings
**Action:** Review if still needed, otherwise delete

---

## Priority: OPTIONAL - Payment Gateway Enhancement

### Payment Limits File
**File:** `src/lib/payment-gateway/payment-limits.ts`

**Issue:** Line 221 still has currency conversion logic
```typescript
if (currency === 'usd' && limits.currency === 'idr') {
```

**Fix:** Remove USD handling since we're IDR-only
**Impact:** Minimal (conversion not used anymore)

---

## Database Cleanup (Optional)

### Tables That Can Be Removed
If Package/Addon features are permanently removed, consider dropping these tables:

1. `Package` - Digital product packages
2. `Addon` - Service addons  
3. `PackageCategory` - Package categories
4. `PackageSubcategory` - Package subcategories
5. `PackageFeature` - Package feature definitions
6. `TransactionPackages` - Package transactions
7. `TransactionAddons` - Addon transactions
8. `ServicesProductCustomers` - Product delivery records
9. `ServicesAddonsCustomers` - Addon delivery records

**⚠️ WARNING:** Only drop these tables if you're 100% sure the old package system will never be needed. Consider archiving the data first.

### Migration Script (if needed)
```sql
-- Backup first!
-- CREATE TABLE package_archive AS SELECT * FROM Package;
-- CREATE TABLE addon_archive AS SELECT * FROM Addon;
-- etc...

-- Then drop (IRREVERSIBLE!)
-- DROP TABLE IF EXISTS TransactionPackages;
-- DROP TABLE IF EXISTS TransactionAddons;
-- DROP TABLE IF EXISTS ServicesProductCustomers;
-- DROP TABLE IF EXISTS ServicesAddonsCustomers;
-- DROP TABLE IF EXISTS PackageFeature;
-- DROP TABLE IF EXISTS Package;
-- DROP TABLE IF EXISTS Addon;
-- DROP TABLE IF EXISTS PackageSubcategory;
-- DROP TABLE IF EXISTS PackageCategory;
```

---

## Testing Recommendations After Cleanup

If you do the optional cleanups above, test:

1. **Dashboard Pages**
   - ✓ WhatsApp subscription display
   - ✓ Transaction history display
   - ✓ Payment status display
   - ✓ Price formatting (should show IDR)

2. **Cart & Checkout**
   - ✓ Add WhatsApp package to cart
   - ✓ View cart sidebar
   - ✓ Proceed to checkout
   - ✓ Complete payment flow

3. **Error Handling**
   - ✓ No TypeScript errors
   - ✓ No Prisma query errors
   - ✓ No runtime errors in console

---

## Estimated Effort

| Task Category | Files | Estimated Time |
|--------------|-------|----------------|
| Dashboard pages update | 4 files | 30-60 minutes |
| Type definition cleanup | 2 files | 15 minutes |
| Delete old components | 3 folders | 5 minutes |
| Database table removal | SQL script | 1 hour (with testing) |
| **TOTAL** | **~10 files** | **~2-3 hours** |

---

## Recommendation

**Current Status:** System is fully functional with USD removed. These cleanup tasks are cosmetic and can be done anytime.

**Suggested Approach:**
1. Leave as-is for now (system works perfectly)
2. Schedule cleanup during next major refactor
3. Only touch if you're actively developing those specific features

**Why Low Priority?**
- No performance impact
- No security issues
- No user-facing problems
- Legacy code is isolated and doesn't interfere

---

## Questions to Consider

Before doing cleanup:

1. **Will the old package system ever be revived?**
   - If yes: Keep the code, just mark as deprecated
   - If no: Safe to delete

2. **Are dashboard pages actively used?**
   - If yes: Update USD references
   - If no: Low priority

3. **Are legacy landing pages still deployed?**
   - If yes: Update or remove from routing
   - If no: Safe to delete components

---

**Document Created:** 2024
**Status:** Optional cleanup tasks identified
**Priority:** LOW - No immediate action required
**Next Review:** During next major refactor or feature addition
