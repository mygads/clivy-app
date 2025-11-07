import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth, getCustomerAuthErrorResponse } from "@/lib/auth-helpers";
import { PaymentExpirationService } from "@/lib/payment-expiration";
import { PaymentGatewayManager } from "@/lib/payment-gateway/gateway-manager";
import { PaymentNotificationService } from "@/services/payment-notification";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

// Validation schema for payment request
const paymentRequestSchema = z.object({
  transactionId: z.string().cuid("Invalid transaction ID"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

// Function to calculate service fee
function calculateServiceFee(amount: number, paymentMethod: any): number {
  if (!paymentMethod || !paymentMethod.isActive) {
    return 0;
  }
  
  // Handle null fee values - default to no fee
  const feeType = paymentMethod.feeType || 'fixed';
  const feeValue = Number(paymentMethod.feeValue) || 0;
  
  if (feeValue === 0) {
    return 0; // No fee configured
  }
  
  let fee = 0;
  if (feeType === 'percentage') {
    fee = amount * (feeValue / 100);
    
    // Apply minimum fee if specified and greater than 0
    const minFee = Number(paymentMethod.minFee) || 0;
    if (minFee > 0 && fee < minFee) {
      fee = minFee;
    }
    
    // Apply maximum fee if specified and greater than 0
    const maxFee = Number(paymentMethod.maxFee) || 0;
    if (maxFee > 0 && fee > maxFee) {
      fee = maxFee;
    }
  } else {
    fee = feeValue;
  }
  
  return Math.round(fee * 100) / 100; // Round to 2 decimal places
}

// POST /api/customer/payment/create - Create payment request with gateway support
export async function POST(request: NextRequest) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth?.id) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    const body = await request.json();
    const validation = paymentRequestSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { transactionId, paymentMethod } = validation.data;

    // Auto-expire this specific transaction before proceeding
    await PaymentExpirationService.autoExpireOnApiCall(transactionId);

    // Check if transaction is still valid for payment creation
    const canCreatePayment = await PaymentExpirationService.canCreatePaymentForTransaction(transactionId);
    
    if (!canCreatePayment) {
      // Get transaction to provide more specific error message
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });
      
      let errorMessage = 'Transaksi tidak dapat digunakan untuk pembayaran baru.';
      
      if (!transaction) {
        errorMessage = 'Transaksi tidak ditemukan.';
      } else if (transaction.expiresAt && new Date() > transaction.expiresAt) {
        errorMessage = 'Transaksi telah kedaluwarsa. Silakan buat pesanan baru.';
      } else if (!['created', 'pending'].includes(transaction.status)) {
        errorMessage = `Transaksi dengan status '${transaction.status}' tidak dapat digunakan untuk pembayaran baru.`;
      }
      
      return withCORS(NextResponse.json({ 
        success: false, 
        error: errorMessage,
        code: 'TRANSACTION_INVALID'
      }, { status: 400 }));
    }

    // Step 1: Validate transaction and prepare data (fast DB operations)
    const transactionData = await prisma.$transaction(async (tx) => {
      // 1. Get transaction details with security check
      const transaction = await tx.transaction.findFirst({
        where: {
          id: transactionId,
          userId: userAuth.id, // Security: ensure user owns this transaction
          status: { in: ['created', 'pending'] }, // Allow payment for created and pending transactions
        },
        include: {
          voucher: true,
          whatsappTransaction: {
            include: {
              whatsappPackage: true,
            }
          }
        }
      });

      if (!transaction) {
        throw new Error("Transaction not found or not available for payment");
      }

      // 2. Check if there's an active payment for this transaction
      const existingPayment = await tx.payment.findFirst({
        where: { 
          transactionId: transaction.id,
          status: { in: ['pending'] } // Only check for pending payments
        }
      });

      // Prevent creation if there's already a pending payment
      if (existingPayment) {
        throw new Error("A pending payment already exists for this transaction. Please cancel or wait for the existing payment to expire before creating a new one.");
      }

      // Check for any other payment for this transaction (cancelled, expired, failed)
      const anyExistingPayment = await tx.payment.findFirst({
        where: { transactionId: transaction.id }
      });

      // 3. Get payment method configuration - allow methods without fee configuration
      const paymentMethodConfig = await tx.paymentMethod.findFirst({
        where: { 
          code: paymentMethod,
          isActive: true
          // Remove feeType and feeValue requirements - allow null values with defaults
        },
        include: {
          bankDetail: true
        }
      });

      if (!paymentMethodConfig) {
        throw new Error(`Payment method '${paymentMethod}' not available or inactive`);
      }

      // 4. Calculate amounts
      const baseAmount = Number(transaction.totalAfterDiscount || transaction.amount);
      const serviceFeeAmount = calculateServiceFee(baseAmount, paymentMethodConfig);
      const finalAmount = baseAmount + serviceFeeAmount;

      // 🆕 ZERO-PRICE PAYMENT DETECTION
      const isZeroPrice = finalAmount === 0;
      const isManualMethod = !paymentMethodConfig.isGatewayMethod || paymentMethodConfig.requiresManualApproval;
      
      console.log(`[PAYMENT_CREATE] Amount: ${finalAmount}, Zero-price: ${isZeroPrice}, Manual method: ${isManualMethod}, Method: ${paymentMethodConfig.code}`);

      return {
        transaction,
        anyExistingPayment,
        paymentMethodConfig,
        baseAmount,
        serviceFeeAmount,
        finalAmount,
        isZeroPrice,
        isManualMethod
      };
    }, {
      timeout: 5000, // Short timeout for validation only
    });

    // Step 2: Call gateway API outside of database transaction (if needed)
    let gatewayResponse;
    const isManualPayment = !transactionData.paymentMethodConfig.isGatewayMethod;
    const requiresManualApproval = transactionData.paymentMethodConfig.requiresManualApproval || isManualPayment;

    if (isManualPayment) {
      // For manual payments (like bank transfer), create minimal gateway response with 24-hour expiry
      gatewayResponse = {
        success: true,
        externalId: null,
        paymentUrl: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours for manual bank transfer
        gatewayResponse: null
      };
      console.log(`[PAYMENT_CREATE] Manual payment method: ${paymentMethod}, using 24-hour expiry`);
    } else {
      // For gateway methods, call the payment gateway (outside transaction)
      const gatewayManager = PaymentGatewayManager.getInstance();
      gatewayResponse = await gatewayManager.createPayment({
        transactionId: transactionData.transaction.id,
        amount: transactionData.finalAmount,
        currency: transactionData.transaction.currency as 'idr' | 'usd',
        paymentMethodCode: paymentMethod,
        customerInfo: {
          id: userAuth.id,
          name: userAuth.name || 'Customer',
          email: userAuth.email || '',
          phone: userAuth.phone || ''
        }
      });

      if (!gatewayResponse.success) {
        // Check if it's a payment amount limit error from Duitku
        const errorMessage = gatewayResponse.error || 'Failed to create payment';
        if (errorMessage.includes('Maximum Payment exceeded') || errorMessage.includes('maximum')) {
          throw new Error(`Payment amount exceeds the maximum limit for ${paymentMethod} payment method. Please choose a different payment method or reduce your order amount.`);
        }
        throw new Error(errorMessage);
      }
      console.log(`[PAYMENT_CREATE] Gateway payment method: ${paymentMethod}, gateway API called successfully`);
    }

    // Step 3: Update database with payment data (fast DB operations)
    const result = await prisma.$transaction(async (tx) => {
      // 5. Update transaction status and amounts
      let updatedTransaction = await tx.transaction.update({
        where: { id: transactionData.transaction.id },
        data: {
          serviceFeeAmount: new Decimal(transactionData.serviceFeeAmount),
          finalAmount: new Decimal(transactionData.finalAmount),
          status: 'pending',
        }
      });

      // 5.1. Update child transaction statuses to pending  - Product/Addon removed, only WhatsApp now
      // WhatsApp transaction status is managed separately
      
      // 7. Create or update payment record
      const expiresAt = gatewayResponse.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default
      
      let payment;
      
      if (transactionData.anyExistingPayment && transactionData.anyExistingPayment.status !== 'pending') {
        // Update existing inactive payment
        payment = await tx.payment.update({
          where: { id: transactionData.anyExistingPayment.id },
          data: {
            amount: new Decimal(transactionData.finalAmount),
            method: paymentMethod,
            status: 'pending',
            serviceFee: new Decimal(transactionData.serviceFeeAmount),
            expiresAt: expiresAt,
            externalId: gatewayResponse.externalId,
            paymentUrl: gatewayResponse.paymentUrl,
            gatewayProvider: transactionData.paymentMethodConfig.gatewayProvider,
            gatewayResponse: gatewayResponse.gatewayResponse || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            paymentDate: null,
            adminNotes: null,
            adminAction: null,
            adminUserId: null,
            actionDate: null,
          }
        });
      } else {
        // Create new payment (should only happen if no payment exists at all)
        // 🆕 ZERO-PRICE AUTO-PAYMENT LOGIC
        const paymentStatus = (transactionData.isZeroPrice && transactionData.isManualMethod) ? 'paid' : 'pending';
        const paymentDate = (transactionData.isZeroPrice && transactionData.isManualMethod) ? new Date() : null;
        const paymentExpiresAt = (transactionData.isZeroPrice && transactionData.isManualMethod) ? null : expiresAt;
        
        if (transactionData.isZeroPrice && transactionData.isManualMethod) {
          console.log(`[ZERO_PRICE_PAYMENT] Auto-setting payment to 'paid' for zero-price manual transfer. Transaction: ${transactionData.transaction.id}`);
        }
        
        payment = await tx.payment.create({
          data: {
            transactionId: transactionData.transaction.id,
            amount: new Decimal(transactionData.finalAmount),
            method: paymentMethod,
            status: paymentStatus,
            serviceFee: new Decimal(transactionData.serviceFeeAmount),
            expiresAt: paymentExpiresAt,
            paymentDate: paymentDate,
            externalId: gatewayResponse.externalId,
            paymentUrl: gatewayResponse.paymentUrl,
            gatewayProvider: transactionData.paymentMethodConfig.gatewayProvider,
            gatewayResponse: gatewayResponse.gatewayResponse || null,
          }
        });
      }

      // 🆕 ZERO-PRICE TRANSACTION STATUS UPDATE
      if (transactionData.isZeroPrice && transactionData.isManualMethod && payment.status === 'paid') {
        console.log(`[ZERO_PRICE_PAYMENT] Updating transaction status to 'in_progress' for zero-price payment. Transaction: ${transactionData.transaction.id}`);
        
        // Update transaction status to in_progress since payment is immediately paid
        updatedTransaction = await tx.transaction.update({
          where: { id: transactionData.transaction.id },
          data: {
            status: 'in_progress',
            serviceFeeAmount: new Decimal(transactionData.serviceFeeAmount),
            finalAmount: new Decimal(transactionData.finalAmount),
          }
        });

        // Update child transaction statuses to in_progress - Product/Addon removed
        await tx.transactionWhatsappService.updateMany({
          where: { transactionId: transactionData.transaction.id },
          data: { status: 'in_progress' }
        });
      }

      return {
        transaction: updatedTransaction,
        payment,
        paymentMethodConfig: transactionData.paymentMethodConfig,
        originalTransaction: transactionData.transaction,
        gatewayResponse,
        requiresManualApproval,
        isManualPayment,
        isZeroPrice: transactionData.isZeroPrice,
        isManualMethod: transactionData.isManualMethod
      };
    }, {
      timeout: 5000, // Short timeout for DB updates only
    });

    // 🆕 ZERO-PRICE SERVICE ACTIVATION TRIGGER  
    if (result.isZeroPrice && result.isManualMethod && result.payment.status === 'paid') {
      console.log(`[ZERO_PRICE_PAYMENT] Triggering automatic service activation for transaction ${result.transaction.id}`);
      
      // Trigger service activation asynchronously to avoid blocking the response
      setImmediate(async () => {
        try {
          // Get full transaction details for activation
          const fullTransaction = await prisma.transaction.findUnique({
            where: { id: result.transaction.id },
            include: {
              whatsappTransaction: {
                include: { whatsappPackage: true }
              }
            }
          });

          if (fullTransaction) {
            const { PaymentExpirationService } = await import('@/lib/payment-expiration');
            await PaymentExpirationService.autoActivateServices(fullTransaction);
            console.log(`[ZERO_PRICE_PAYMENT] Successfully activated services for transaction ${result.transaction.id}`);
          }
        } catch (error) {
          console.error(`[ZERO_PRICE_PAYMENT] Error activating services for transaction ${result.transaction.id}:`, error);
        }
      });
    }

    // 9. Prepare response with payment instructions
    const paymentInstructions = getPaymentInstructions(
      result.paymentMethodConfig,
      result.payment,
      result.paymentMethodConfig,
      result.requiresManualApproval
    );

    // 10. Send WhatsApp notification to customer
    try {
      const notificationData = buildPaymentNotificationData(
        result,
        userAuth,
        transactionData.transaction,
        paymentInstructions
      );
      
      // console.log(`[PAYMENT_CREATE] Building notification for user ${userAuth.id}, phone: ${userAuth.phone}, name: ${userAuth.name}, email: ${userAuth.email}`);
      // console.log(`[PAYMENT_CREATE] userAuth object:`, JSON.stringify(userAuth, null, 2));
      
      // Send notification asynchronously (don't wait for result)
      PaymentNotificationService.sendPaymentCreatedNotification(notificationData)
        .then(sent => {
          if (sent) {
            // console.log(`[PAYMENT_CREATE] WhatsApp notification sent to ${userAuth.phone} for payment ${result.payment.id}`);
          } else {
            console.log(`[PAYMENT_CREATE] WhatsApp notification failed for payment ${result.payment.id}`);
          }
        })
        .catch(error => {
          console.error(`[PAYMENT_CREATE] WhatsApp notification error for payment ${result.payment.id}:`, error);
        });
    } catch (error) {
      console.error('[PAYMENT_CREATE] Error preparing WhatsApp notification:', error);
    }

    const response = {
      success: true,
      data: {
        payment: {
          id: result.payment.id,
          transactionId: result.transaction.id,
          amount: Number(result.payment.amount),
          method: result.payment.method,
          status: result.payment.status,
          paymentUrl: result.payment.paymentUrl,
          externalId: result.payment.externalId,
          createdAt: result.payment.createdAt,
          expiresAt: result.payment.expiresAt,
          gatewayProvider: result.payment.gatewayProvider,
          requiresManualApproval: result.requiresManualApproval,
          isManualPayment: result.isManualPayment,
          instructions: paymentInstructions,
          // Payment instructions from payment method
          paymentInstructions: result.paymentMethodConfig.paymentInstructions,
          instructionType: result.paymentMethodConfig.instructionType,
          instructionImageUrl: result.paymentMethodConfig.instructionImageUrl,
        },
        transaction: {
          id: result.transaction.id,
          currency: result.transaction.currency,
          status: result.transaction.status,
          type: result.transaction.type,
          notes: result.transaction.notes,
          expiresAt: result.transaction.expiresAt,
        },
        pricing: {
          subtotal: Number(result.transaction.originalAmount),
          discountAmount: Number(result.transaction.discountAmount || 0),
          totalAfterDiscount: Number(result.transaction.totalAfterDiscount || result.transaction.amount),
          serviceFee: {
            paymentMethod: result.paymentMethodConfig.code,
            method: result.paymentMethodConfig.name,
            type: result.paymentMethodConfig.feeType,
            value: Number(result.paymentMethodConfig.feeValue),
            amount: Number(result.payment.serviceFee),
            currency: 'idr',
            description: result.paymentMethodConfig.feeType === 'percentage' 
              ? `${Number(result.paymentMethodConfig.feeValue)}% fee` 
              : `Fixed fee IDR ${Number(result.paymentMethodConfig.feeValue).toLocaleString()}`
          },
          finalAmount: Number(result.payment.amount),
          currency: result.transaction.currency,
        },
        items: buildTransactionItems(transactionData.transaction),
        voucher: transactionData.transaction.voucher ? {
          code: transactionData.transaction.voucher.code,
          name: transactionData.transaction.voucher.name,
          discountAmount: Number(result.transaction.discountAmount || 0),
        } : null,
        expirationInfo: {
          paymentExpiresAt: result.payment.expiresAt,
          transactionExpiresAt: result.transaction.expiresAt,
          paymentTimeRemaining: result.payment.expiresAt ? Math.max(0, Math.floor((new Date(result.payment.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60))) + " hours" : null,
          transactionTimeRemaining: result.transaction.expiresAt ? Math.max(0, Math.floor((new Date(result.transaction.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) + " days" : null
        },
        
        // 🆕 Zero-price payment information
        zeroPrice: result.isZeroPrice ? {
          autoPaid: result.payment.status === 'paid',
          servicesActivating: result.payment.status === 'paid',
          message: result.payment.status === 'paid' 
            ? 'Payment automatically processed for zero-price order. Services are being activated.'
            : 'Zero-price payment detected but requires manual processing.'
        } : null,
      },
      message: result.isZeroPrice && result.payment.status === 'paid'
        ? `Zero-price payment completed successfully! Services are being activated automatically.`
        : result.requiresManualApproval 
          ? `Payment created successfully. This payment requires manual approval by admin. Please follow the payment instructions and wait for confirmation.`
          : `Payment created successfully using ${result.paymentMethodConfig.name}. Please complete payment using the provided URL or instructions.`
    };

    return withCORS(NextResponse.json(response));

  } catch (error) {
    console.error("[PAYMENT_CREATE_ERROR]", error);
    
    if (error instanceof Error) {
      return withCORS(NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      ));
    }

    return withCORS(NextResponse.json(
      { success: false, error: "Failed to create payment" },
      { status: 500 }
    ));
  }
}

// Helper function to generate payment instructions
function getPaymentInstructions(paymentMethod: any, payment: any, serviceFee: any, requiresManualApproval: boolean): string {
  const amount = Number(payment.amount);
  const currency = serviceFee.currency.toUpperCase();
  const formattedAmount = currency === 'IDR' 
    ? `Rp ${amount.toLocaleString('id-ID')}`
    : `$${amount.toFixed(2)}`;

  if (requiresManualApproval) {
    // Manual payment instructions
    if (paymentMethod.bankDetail) {
      return `Please transfer exactly ${formattedAmount} to:\n` +
             `Bank: ${paymentMethod.bankDetail.bankName}\n` +
             `Account: ${paymentMethod.bankDetail.accountNumber}\n` +
             `Name: ${paymentMethod.bankDetail.accountName}\n` +
             `${paymentMethod.bankDetail.swiftCode ? `SWIFT: ${paymentMethod.bankDetail.swiftCode}\n` : ''}` +
             `Reference: Payment ${payment.id}\n\n` +
             `After transfer, admin will verify and approve your payment within 1-24 hours.`;
    } else {
      return `Please complete payment of ${formattedAmount} using ${paymentMethod.name}. ` +
             `This payment requires manual verification by admin. Processing time: 1-24 hours.`;
    }
  } else {
    // Gateway payment instructions
    if (payment.paymentUrl) {
      return `Click the payment link to complete your ${formattedAmount} payment using ${paymentMethod.name}. ` +
             `Payment will be processed automatically.`;
    } else {
      // Check if it's a retail payment method that needs specific instructions
      const paymentCode = paymentMethod.code?.replace('duitku_', '') || '';
      
      if (paymentCode === 'IR') {
        // Indomaret payment instructions
        return `Instruksi Pembayaran Indomaret:\n\n` +
               `1. Catat dan simpan Kode Pembayaran Anda\n` +
               `2. Datang ke Gerai retail Indomaret / Ceriamart / Lion Super Indo\n` +
               `3. Informasikan kepada kasir akan melakukan "Pembayaran Clivy"\n` +
               `4. Apabila kasir mengatakan tidak melayani pembayaran untuk "Clivy", Anda dapat menginformasikan bahwa pembayaran ini merupakan Payment Point pada Kategori "e-Commerce"\n` +
               `5. Tunjukkan dan berikan Kode Pembayaran ke Kasir\n` +
               `6. Lakukan pembayaran sesuai nominal ${formattedAmount} dan tunggu proses selesai\n` +
               `7. Minta dan simpan struk sebagai bukti pembayaran\n` +
               `8. Pembayaran Anda akan langsung terdeteksi secara otomatis`;
      } else if (paymentCode === 'FT') {
        // Alfamart/retail group payment instructions
        return `Instruksi Pembayaran Alfamart Group:\n\n` +
               `1. Catat dan simpan Kode Pembayaran Anda\n` +
               `2. Datang ke Gerai retail (Alfamart, Kantor Pos, Pegadaian, & Dan-Dan)\n` +
               `3. Informasikan kepada kasir akan melakukan "Pembayaran Telkom/Indihome/Finpay"\n` +
               `4. Jika kasir menanyakan jenis pembayaran Telkom, pilih pembayaran untuk "Telepon Rumah" atau "Indihome atau Finpay"\n` +
               `5. Tunjukkan dan berikan Kode Pembayaran ke Kasir\n` +
               `6. Lakukan pembayaran sesuai nominal ${formattedAmount} dan tunggu proses selesai\n` +
               `7. Minta dan simpan struk sebagai bukti pembayaran\n` +
               `8. Pembayaran Anda akan langsung terdeteksi secara otomatis`;
      } else {
        // Default gateway payment instructions
        return `Complete payment of ${formattedAmount} using ${paymentMethod.name}. ` +
               `Payment will be processed automatically once completed.`;
      }
    }
  }
}

// Helper function to build transaction items
function buildTransactionItems(transaction: any): Array<{
  type: string;
  name: string;
  category?: string;
  subcategory?: string;
  duration?: string;
  quantity: number;
}> {
  const items: Array<any> = [];

  // Add WhatsApp service items (only service type now - product/addon removed)
  if (transaction.whatsappTransaction) {
    const whatsappTx = transaction.whatsappTransaction;
    items.push({
      type: 'whatsapp_service',
      name: whatsappTx.whatsappPackage.name,
      duration: whatsappTx.duration,
      quantity: 1,
    });
  }

  return items;
}

// Helper function to build payment notification data
function buildPaymentNotificationData(
  result: any,
  userAuth: any,
  transaction: any,
  instructions: string
): any {
  // Build items for notification (WhatsApp only - product/addon removed)
  const items = [];

  // Add WhatsApp service items
  if (transaction.whatsappTransaction) {
    const whatsappTx = transaction.whatsappTransaction;
    const price = whatsappTx.duration === 'month' ? whatsappTx.whatsappPackage.priceMonth : whatsappTx.whatsappPackage.priceYear;
    
    items.push({
      name: whatsappTx.whatsappPackage.name,
      quantity: 1,
      price: price,
      type: 'whatsapp_service' as const,
      duration: whatsappTx.duration,
    });
  }

  // Determine payment method details
  let paymentCode = null;
  let qrAvailable = false;
  
  if (result.gatewayResponse?.gatewayResponse) {
    const gatewayData = result.gatewayResponse.gatewayResponse;
    if (gatewayData.vaNumber) {
      paymentCode = gatewayData.vaNumber;
    }
    if (gatewayData.qrString) {
      qrAvailable = true;
    }
  }

  return {
    paymentId: result.payment.id,
    customerName: userAuth.name || 'Customer',
    customerPhone: userAuth.phone || '',
    items: items,
    subtotal: Number(transaction.originalAmount || transaction.amount),
    discountAmount: Number(transaction.discountAmount || 0),
    serviceFeeAmount: Number(result.payment.serviceFee || 0),
    finalAmount: Number(result.payment.amount),
    currency: transaction.currency,
    paymentMethod: result.payment.method,
    paymentMethodName: result.paymentMethodConfig.name,
    paymentUrl: result.payment.paymentUrl,
    expiresAt: result.payment.expiresAt,
    instructions: instructions,
    paymentCode: paymentCode,
    qrAvailable: qrAvailable,
  };
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
