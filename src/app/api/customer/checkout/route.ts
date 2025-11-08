import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { authenticateCustomerRequest, getAuthErrorResponse } from "@/lib/request-auth";
import { PaymentExpirationService } from "@/lib/payment-expiration";
import { validatePaymentAmount, getFormattedLimits, isPaymentAmountValid } from "@/lib/payment-gateway/payment-limits";
import { detectCurrency } from "@/lib/currency-detection";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * SIMPLIFIED CHECKOUT API - WHATSAPP SERVICE ONLY
 * 
 * This checkout endpoint handles only WhatsApp API services.
 * 
 * Flow:
 * 1. Customer selects WhatsApp package (monthly or yearly)
 * 2. POST /api/customer/checkout (creates transaction with 'created' status)
 * 3. Returns transaction ID, pricing breakdown, and service fee previews
 * 4. Customer selects payment method
 * 5. POST /api/customer/payment/create (creates payment with selected method)
 * 6. Customer completes payment through gateway
 * 7. Payment status updates automatically via webhooks or manual verification
 * 8. WhatsApp service activated/extended automatically upon payment success
 */

// Simplified validation schema - WhatsApp service only
const checkoutSchema = z.object({
  whatsapp: z.object({
    packageId: z.string().cuid(),
    duration: z.enum(['month', 'year']),
  }),
  
  voucherCode: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

// Function to calculate service fee preview - now always uses IDR
function calculateServiceFeePreview(amount: number, paymentMethods: any[]): any[] {
  return paymentMethods
    .map(method => {
      let feeAmount = 0;
      
      // Handle null fee values - default to 0 (no fee)
      const feeType = method.feeType || 'fixed';
      const feeValue = Number(method.feeValue) || 0;
      
      if (feeType === 'percentage') {
        // Calculate percentage fee
        feeAmount = amount * (feeValue / 100);
        
        // Apply minimum fee if specified and greater than 0
        const minFee = Number(method.minFee) || 0;
        if (minFee > 0 && feeAmount < minFee) {
          feeAmount = minFee;
        }
        
        // Apply maximum fee if specified and greater than 0
        const maxFee = Number(method.maxFee) || 0;
        if (maxFee > 0 && feeAmount > maxFee) {
          feeAmount = maxFee;
        }
      } else if (feeType === 'fixed') {
        feeAmount = feeValue;
      }

      const totalWithFee = Math.round((amount + feeAmount) * 100) / 100;

      // Check if payment amount is valid for this method - always use IDR
      const isValid = isPaymentAmountValid(
        method.code, 
        method.isGatewayMethod, 
        totalWithFee, 
        'idr'
      );

      return {
        paymentMethod: method.code,
        name: method.name,
        type: feeType,
        value: feeValue,
        feeAmount: Math.round(feeAmount * 100) / 100,
        totalWithFee: totalWithFee,
        requiresManualApproval: method.requiresManualApproval,
        paymentInstructions: method.paymentInstructions,
        isValid: isValid
      };
    })
    .filter(preview => preview.isValid); // Only return valid payment methods
}

// POST /api/customer/checkout - Unified checkout (WhatsApp service only)
export async function POST(request: NextRequest) {
  try {
    const userAuth = await authenticateCustomerRequest(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        getAuthErrorResponse(),
        { status: 401 }
      ));
    }

    // Auto-expire any existing payments/transactions for this user
    await PaymentExpirationService.autoExpireOnApiCall();

    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { whatsapp, voucherCode, notes } = validation.data;
    
    // Always use IDR currency
    const currency = 'idr';
    
    console.log(`[CHECKOUT] Using IDR currency for user ${userAuth.id}`);
    console.log(`[CHECKOUT] User ${userAuth.id} creating WhatsApp service transaction`);


    // Process transaction in database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch and validate WhatsApp package
      const orderItems = [];
      let subtotal = new Decimal(0);

      // Process WhatsApp service
      const whatsappPackage = await tx.whatsappApiPackage.findUnique({
        where: { id: whatsapp.packageId }
      });

      if (!whatsappPackage) {
        throw new Error(`WhatsApp package with ID ${whatsapp.packageId} not found`);
      }

      const price = whatsapp.duration === 'month' 
        ? whatsappPackage.priceMonth
        : whatsappPackage.priceYear;
      subtotal = subtotal.add(price);

      orderItems.push({
        id: whatsappPackage.id,
        type: 'whatsapp',
        name: whatsappPackage.name,
        description: whatsappPackage.description,
        price: price,
        quantity: 1, // WhatsApp always quantity 1
        total: price,
        currency: currency,
        duration: whatsapp.duration,
        maxSession: whatsappPackage.maxSession,
      });

      // 2. Process voucher if provided
      let voucher = null;
      let discountAmount = new Decimal(0);

      if (voucherCode) {
        voucher = await tx.voucher.findUnique({
          where: { code: voucherCode, isActive: true }
        });

        if (!voucher) {
          throw new Error("Invalid or inactive voucher code");
        }

        // Voucher currency check removed - now all vouchers are IDR

        // Check voucher validity
        const now = new Date();
        if (voucher.startDate > now || (voucher.endDate && voucher.endDate < now)) {
          throw new Error("Voucher is not valid at this time");
        }

        // Check usage limit
        if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
          throw new Error("Voucher usage limit exceeded");
        }

        // Check minimum amount
        if (voucher.minAmount && subtotal.lt(voucher.minAmount)) {
          throw new Error(`Minimum order amount for this voucher is ${voucher.minAmount}`);
        }        // Calculate discount based on voucher type (percentage vs fixed_amount)
        // Handle both correct and swapped field scenarios
        let calculationType = voucher.type;
        
        // If type is not a calculation type, check if discountType contains the calculation type
        if (voucher.type !== 'percentage' && voucher.type !== 'fixed_amount') {
          if (voucher.discountType === 'percentage' || voucher.discountType === 'fixed_amount') {
            calculationType = voucher.discountType;
          } else {
            // Default to fixed_amount if neither field contains a valid calculation type
            calculationType = 'fixed_amount';
          }
        }
        
        if (calculationType === 'percentage') {
          discountAmount = subtotal.mul(Number(voucher.value)).div(100);
          if (voucher.maxDiscount && discountAmount.gt(Number(voucher.maxDiscount))) {
            discountAmount = new Decimal(Number(voucher.maxDiscount));
          }
        } else {
          discountAmount = new Decimal(Number(voucher.value));
        }

        // Ensure discount doesn't exceed subtotal (prevent negative totals)
        if (discountAmount.gt(subtotal)) {
          discountAmount = subtotal;
        }
      }

      const totalAfterDiscount = subtotal.sub(discountAmount);
      
      // Ensure total never goes below zero (additional safety check)
      const finalTotal = totalAfterDiscount.lt(0) ? new Decimal(0) : totalAfterDiscount;      
      
      // 3. Get all active payment methods
      const paymentMethods = await tx.paymentMethod.findMany({
        where: { 
          isActive: true
        },
        include: {
          bankDetail: true
        },
        orderBy: { code: 'asc' }
      });

      // Filter and calculate service fees (handle null fee values)
      const validPaymentMethods = paymentMethods.map(method => ({
        ...method,
        feeType: method.feeType || 'fixed',
        feeValue: method.feeValue || 0
      }));

      const serviceFeePreviews = calculateServiceFeePreview(finalTotal.toNumber(), validPaymentMethods);
      
      // 🆕 ZERO-PRICE CHECKOUT LOGIC
      const isZeroPrice = finalTotal.eq(0);
      const autoPayment = null; // No auto-payment at checkout stage
      const autoTransaction = null;
      const manualPaymentMethod = null; // Will be selected at payment page
      
      if (isZeroPrice) {
        console.log(`[ZERO_PRICE_CHECKOUT] Zero-price checkout detected for user ${userAuth.id}. User will proceed to payment page to select manual method.`);
      }      
      
      // 4. Transaction type is always WhatsApp service
      const transactionType = 'whatsapp_service';
      
      // 5. Create transaction record with automatic expiration (1 week)
      const transaction = await PaymentExpirationService.createTransactionWithExpiration({
        userId: userAuth.id,
        amount: Number(subtotal),
        type: transactionType,
        currency: currency,
        voucherId: voucher?.id,
        notes: notes,
        discountAmount: Number(discountAmount),
        originalAmount: Number(subtotal),
        totalAfterDiscount: Number(finalTotal),
      });

      // 6. Create WhatsApp transaction details
      await tx.transactionWhatsappService.create({
        data: {
          transactionId: transaction.id,
          whatsappPackageId: whatsapp.packageId,
          duration: whatsapp.duration,
        }
      });

      // 7. Update voucher usage count
      if (voucher) {
        await tx.voucher.update({
          where: { id: voucher.id },
          data: { usedCount: { increment: 1 } }
        });

        // Track voucher usage
        await tx.voucherUsage.create({
          data: {
            voucherId: voucher.id,
            userId: userAuth.id,
            transactionId: transaction.id,
            discountAmount: discountAmount,
          }
        });
      }

      // 🆕 ZERO-PRICE CHECKOUT LOGIC - Note payment method filtering only
      // Auto-payment will be handled in payment creation endpoint
      // This ensures user goes through payment page flow

      return {
        transaction: transaction, // Don't auto-update status here
        orderItems,
        voucher,
        discountAmount,
        serviceFeePreviews,
        paymentMethods,
        subtotal,
        totalAfterDiscount: finalTotal, // Use finalTotal
        autoPayment: null, // No auto-payment at checkout
        isZeroPrice: isZeroPrice
      };
    });

    // 9. Prepare response
    const response = {
      success: true,
      data: {
        transactionId: result.transaction.id,
        status: result.transaction.status,
        currency: currency,
        notes: result.transaction.notes,
        createdAt: result.transaction.createdAt,
        expiresAt: result.transaction.expiresAt,
        
        // Order summary
        items: result.orderItems,
        totalItems: result.orderItems.reduce((sum, item) => sum + item.quantity, 0),
        
        // Pricing breakdown
        subtotal: Number(result.subtotal),
        voucher: result.voucher ? {
          code: result.voucher.code,
          name: result.voucher.name,
          type: result.voucher.type,
          discountAmount: Number(result.discountAmount)
        } : null,
        totalDiscount: Number(result.discountAmount),
        totalAfterDiscount: Number(result.totalAfterDiscount),
        // Service fee previews for valid payment methods only
        serviceFeePreview: result.serviceFeePreviews,
        
        // Available payment methods (only valid ones based on payment amount)
        availablePaymentMethods: result.paymentMethods
          .filter((method: any) => {
            // For zero-price orders, only show manual methods (non-gateway methods)
            if (result.isZeroPrice) {
              return !method.isGatewayMethod || method.requiresManualApproval;
            }
            
            // For non-zero prices, check if this method has valid limits for the amount - always use IDR
            return isPaymentAmountValid(
              method.code, 
              method.isGatewayMethod, 
              Number(result.totalAfterDiscount), 
              'idr'
            );
          })
          .map((method: any) => {
            return {
              code: method.code,
              name: method.name,
              type: method.type,
              isActive: method.isActive,
              isGatewayMethod: method.isGatewayMethod,
              gatewayProvider: method.gatewayProvider,
              requiresManualApproval: method.requiresManualApproval,
              serviceFee: {
                type: method.feeType || 'fixed',
                value: Number(method.feeValue) || 0,
                description: (method.feeType && method.feeValue) 
                  ? (method.feeType === 'percentage' 
                    ? `${Number(method.feeValue)}% fee` 
                    : `Fixed fee IDR ${Number(method.feeValue).toLocaleString()}`)
                  : 'No service fee',
                minFee: method.minFee ? Number(method.minFee) : null,
                maxFee: method.maxFee ? Number(method.maxFee) : null,
              },
              bankDetail: method.bankDetail ? {
                bankName: method.bankDetail.bankName,
                accountNumber: method.bankDetail.accountNumber,
                accountName: method.bankDetail.accountName,
                swiftCode: method.bankDetail.swiftCode,
              } : null,
              paymentInstructions: method.paymentInstructions,
              instructionType: method.instructionType,
              instructionImageUrl: method.instructionImageUrl,
              gatewayImageUrl: method.gatewayImageUrl,
            };
          }),
        
        // Expiration info
        expirationInfo: {
          transactionExpiresAt: result.transaction.expiresAt,
          paymentExpiresAfterCreation: "1 day",
          transactionExpiresAfterCreation: "7 days",
          timeRemaining: result.transaction.expiresAt ? Math.max(0, Math.floor((new Date(result.transaction.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) + " days" : null
        },
        
        // 🆕 Zero-price checkout information
        zeroPrice: result.isZeroPrice ? {
          detectedZeroPrice: true,
          requiresPaymentPageFlow: true,
          availableMethodsFiltered: true,
          message: 'Zero-price order detected. Please proceed to payment page and select manual bank transfer method for automatic processing.'
        } : null,
        
        // Next steps
        nextStep: result.isZeroPrice 
          ? "Zero-price detected. Proceed to payment page and select manual bank transfer for automatic processing."
          : "Select payment method from availablePaymentMethods and call /api/customer/payment/create",
      },
      message: result.isZeroPrice 
        ? "Zero-price checkout detected! Please proceed to payment page and select manual bank transfer for automatic processing."
        : "Checkout successful. Available payment methods are determined by active service fees for your selected currency."
    };

    return withCORS(NextResponse.json(response));
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') {
      return withCORS(NextResponse.json({
        success: false,
        error: "Database temporarily unavailable. Please try again later.",
        code: "DATABASE_UNAVAILABLE"
      }, { status: 500 }));
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to process checkout";
    return withCORS(NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
