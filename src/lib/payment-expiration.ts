import { prisma } from './prisma';

export class PaymentExpirationService {
  
  // Static map to track activation locks per transaction
  private static activationLocks: Map<string, boolean> = new Map();

  /**
   * Check if transaction activation is currently locked
   */
  private static isActivationLocked(transactionId: string): boolean {
    return this.activationLocks.get(transactionId) === true;
  }

  /**
   * Lock transaction activation to prevent concurrent processing
   */
  private static lockActivation(transactionId: string): void {
    this.activationLocks.set(transactionId, true);
  }

  /**
   * Unlock transaction activation
   */
  private static unlockActivation(transactionId: string): void {
    this.activationLocks.delete(transactionId);
  }

  /**
   * Create a payment with automatic expiration based on payment method
   * Uses Duitku gateway expiry periods for accurate timing
   */
  static async createPaymentWithExpiration(paymentData: {
    transactionId: string;
    amount: number;
    method: string;
    serviceFee?: number;
    externalId?: string;
    paymentUrl?: string;
  }) {
    // Calculate expiry time based on payment method (Duitku periods)
    const expiresAt = this.calculatePaymentExpiryTime(paymentData.method);

    return await prisma.payment.create({
      data: {
        ...paymentData,
        status: 'pending',
        expiresAt,
        amount: paymentData.amount,
        serviceFee: paymentData.serviceFee || 0
      }
    });
  }

  /**
   * Calculate payment expiry time based on Duitku payment method codes
   * This matches the expiry periods defined in DuitkuPaymentGateway
   */
  private static calculatePaymentExpiryTime(paymentMethod: string): Date {
    // Extract Duitku payment method code (remove 'duitku_' prefix if exists)
    const duitkuMethod = paymentMethod.replace(/^duitku_/, '').toUpperCase();
    
    // Duitku expiry periods in minutes (matching DuitkuPaymentGateway)
    const expiryMapping: { [key: string]: number } = {
      // Credit Card - 30 minutes (fixed, cannot be changed)
      'VC': 30,
      
      // Virtual Account - maximum >1440 minutes (use 1440 for consistency)
      'BC': 1440,   // BCA VA
      'M2': 1440,   // Mandiri VA
      'VA': 1440,   // Maybank VA
      'I1': 1440,   // BNI VA
      'B1': 1440,   // CIMB Niaga VA
      'BT': 1440,   // Permata Bank VA
      'A1': 1440,   // ATM Bersama
      'AG': 1440,   // Bank Artha Graha
      'NC': 1440,   // Bank Neo Commerce/BNC
      'BR': 1440,   // BRIVA
      'S1': 1440,   // Bank Sahabat Sampoerna
      'DM': 1440,   // Danamon VA
      'BV': 1440,   // BSI VA
      
      // Retail - maximum >1440 minutes (use 1440 for consistency)
      'FT': 1440,   // Pegadaian/ALFA/Pos
      'IR': 1440,   // Indomaret
      
      // E-Wallet - use maximum allowed periods
      'OV': 1440,   // OVO - max 1440 minutes
      'SA': 60,     // Shopee Pay Apps - max 60 minutes
      'LF': 1440,   // LinkAja Apps (Fixed Fee) - max 1440 minutes
      'LA': 1440,   // LinkAja Apps (Percentage Fee) - max 1440 minutes
      'DA': 1440,   // DANA - max 1440 minutes
      'SL': 30,     // Shopee Pay Account Link - 30 minutes (fixed)
      'OL': 15,     // OVO Account Link - 15 minutes (fixed)
      'JP': 10,     // Jenius Pay - max 10 minutes
      
      // QRIS - use maximum allowed periods
      'SP': 60,     // Shopee Pay QRIS - max 60 minutes
      'NQ': 1440,   // Nobu QRIS - max 1440 minutes
      'GQ': 60,     // Gudang Voucher QRIS - max 60 minutes
      'SQ': 60,     // Nusapay QRIS - max 60 minutes
      
      // Paylater - use maximum allowed periods
      'DN': 1440,   // Indodana Paylater - max 1440 minutes
      'AT': 720,    // ATOME - max 720 minutes
    };
    
    const expiryMinutes = expiryMapping[duitkuMethod] || 1440; // Default to 1440 minutes (24 hours)
    
    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + (expiryMinutes * 60 * 1000));
    
    return expiresAt;
  }
  /**
   * Create a transaction with automatic expiration (1 week from now)
   */
  static async createTransactionWithExpiration(transactionData: {
    userId: string;
    amount: number;
    type: string;
    currency?: string;
    voucherId?: string;
    notes?: string;
    discountAmount?: number;
    originalAmount?: number;
    finalAmount?: number;
    serviceFeeAmount?: number;
    totalAfterDiscount?: number;
  }) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 1 week from now

    return await prisma.transaction.create({
      data: {
        ...transactionData,
        status: 'created', // Transaction created, ready for payment selection
        currency: transactionData.currency || 'idr',
        expiresAt
      }
    });
  }
  /**
   * Check if a transaction is expired and can still create payments
   * This should allow creating new payments as long as the TRANSACTION is not expired,
   * even if previous PAYMENTS have expired
   */
  static async canCreatePaymentForTransaction(transactionId: string): Promise<boolean> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return false;
    }

    // Check if TRANSACTION is expired (not payment expiration)
    // Transactions expire after 7 days, payments expire after 1 day
    if (transaction.expiresAt && new Date() > transaction.expiresAt) {
      return false;
    }

    // Check if transaction status allows payment creation
    // Can create payment for 'created' and 'pending' status transactions
    // Note: 'pending' transactions can have new payments created if previous payments expired
    if (!['created', 'pending'].includes(transaction.status)) {
      return false;
    }

    return true;
  }
  /**
   * Update payment status and sync with transaction
   */
  static async updatePaymentStatus(
    paymentId: string, 
    status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled',
    adminNotes?: string,
    adminUserId?: string
  ) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { transaction: true }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Clear expiration dates based on new rules
    let paymentExpiresAt = payment.expiresAt;
    let transactionExpiresAt = payment.transaction?.expiresAt;

    // Expired date should only apply for 'created' or 'pending' status
    if (status !== 'pending') {
      paymentExpiresAt = null; // Clear payment expiration
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        paymentDate: status === 'paid' ? new Date() : payment.paymentDate,
        adminNotes,
        adminUserId,
        actionDate: new Date(),
        updatedAt: new Date(),
        expiresAt: paymentExpiresAt
      }
    });    // Sync transaction status based on new consolidated status model
    if (payment.transaction) {
      let newTransactionStatus = payment.transaction.status;
      
      if (status === 'paid') {
        // Payment successful -> move to in_progress (waiting for delivery/activation)
        newTransactionStatus = 'in_progress';
        transactionExpiresAt = null; // Clear transaction expiration when paid
      } else if (status === 'failed' || status === 'expired') {
        // Payment failed/expired -> mark transaction as expired
        newTransactionStatus = 'expired';
        transactionExpiresAt = null; // Clear transaction expiration
      }
      // For 'pending' and 'cancelled', transaction status should move to 'pending' (waiting for new payment)
      else if (status === 'cancelled' && payment.transaction.status === 'created') {
        // If payment cancelled but transaction was created, move back to created (can create new payment)
        newTransactionStatus = 'created';
      }

      // Only update transaction status if it actually needs to change
      if (newTransactionStatus !== payment.transaction.status || 
          transactionExpiresAt !== payment.transaction.expiresAt) {
        const updatedTransaction = await prisma.transaction.update({
          where: { id: payment.transaction.id },
          data: {
            status: newTransactionStatus,
            updatedAt: new Date(),
            expiresAt: transactionExpiresAt
          },          include: {
            whatsappTransaction: {
              include: { whatsappPackage: true }
            }
          }
        });

        // Auto-activate services when payment is paid and transaction moves to in_progress
        if (status === 'paid' && newTransactionStatus === 'in_progress') {
          // Update child transaction statuses to in_progress when payment is paid
          await this.updateChildTransactionStatuses(payment.transaction.id, 'in_progress');
          
          // NOTE: Activation will be handled by admin API using activateServicesAfterPaymentUpdate
          // This prevents double activation from both updatePaymentStatus and admin approval
          console.log(`[ACTIVATION_QUEUED] Services activation queued for transaction ${payment.transaction.id}`);
        }
      }
    }

    return updatedPayment;
  }

  /**
   * Cancel transaction by user
   */
  static async cancelTransactionByUser(transactionId: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: transactionId,
        userId: userId
      },
      include: { payment: true }
    });

    if (!transaction) {
      throw new Error('Transaction not found or unauthorized');
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    // Update payment status if exists
    if (transaction.payment) {
      await prisma.payment.update({
        where: { id: transaction.payment.id },
        data: {
          status: 'cancelled',
          updatedAt: new Date()
        }
      });
    }

    return transaction;
  }
  /**
   * Get expired payments (for cron job)
   */
  static async getExpiredPayments() {
    return await prisma.payment.findMany({
      where: {
        status: 'pending',
        expiresAt: {
          lt: new Date()
        }
      },
      include: {
        transaction: true
      }
    });
  }

  /**
   * Get expired transactions (for cron job)
   */  static async getExpiredTransactions() {
    return await prisma.transaction.findMany({
      where: {
        status: {
          in: ['created', 'pending'] // Only expire transactions that haven't been paid
        },
        expiresAt: {
          lt: new Date()
        }
      }
    });
  }

  /**
   * Process expired payments (for cron job)
   */
  static async processExpiredPayments() {
    const expiredPayments = await this.getExpiredPayments();
    
    const updatePromises = expiredPayments.map(async (payment) => {
      return await this.updatePaymentStatus(payment.id, 'expired');
    });

    return await Promise.all(updatePromises);
  }

  /**
   * Process expired transactions (for cron job)
   */
  static async processExpiredTransactions() {
    const expiredTransactions = await this.getExpiredTransactions();
    
    const updatePromises = expiredTransactions.map(async (transaction) => {
      return await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'expired',
          updatedAt: new Date()
        }
      });
    });

    return await Promise.all(updatePromises);
  }
  /**
   * Auto-expire payments and transactions on API calls
   * This will be called on every payment/transaction API request
   */
  static async autoExpireOnApiCall(transactionId?: string, paymentId?: string) {
    const now = new Date();
    
    try {
      // Expire specific payment if paymentId provided
      if (paymentId) {
        await prisma.payment.updateMany({
          where: {
            id: paymentId,
            status: 'pending',
            expiresAt: {
              lt: now
            }
          },
          data: {
            status: 'expired',
            updatedAt: now
          }
        });
      }      // Expire specific transaction if transactionId provided
      if (transactionId) {
        await prisma.transaction.updateMany({
          where: {
            id: transactionId,
            status: {
              in: ['created', 'pending']
            },
            expiresAt: {
              lt: now
            }
          },
          data: {
            status: 'expired',
            updatedAt: now
          }
        });
      }

      // If no specific IDs provided, expire all pending expired items
      if (!paymentId && !transactionId) {
        const [expiredPayments, expiredTransactions] = await Promise.all([
          prisma.payment.updateMany({
            where: {
              status: 'pending',
              expiresAt: {
                lt: now
              }
            },
            data: {
              status: 'expired',
              updatedAt: now
            }
          }),          prisma.transaction.updateMany({
            where: {
              status: {
                in: ['created', 'pending']
              },
              expiresAt: {
                lt: now
              }
            },
            data: {
              status: 'expired',
              updatedAt: now
            }
          })
        ]);        
        if (expiredPayments.count > 0 || expiredTransactions.count > 0) {
          console.log(`[AUTO_EXPIRE] Expired ${expiredPayments.count} payments and ${expiredTransactions.count} transactions`);
        }

        // Clear expiration dates for items that are no longer in created/pending status
        await this.clearExpiredDatesForCompletedItems();
      }
    } catch (error) {
      console.error('[AUTO_EXPIRE] Error during auto-expiration:', error);
      // Don't throw error to avoid breaking the main API call
    }
  }

  /**
   * Clear expiration dates for transactions and payments that are no longer in created/pending status
   */
  private static async clearExpiredDatesForCompletedItems() {
    try {
      const now = new Date();

      // Clear payment expiration dates for non-pending payments
      const clearedPayments = await prisma.payment.updateMany({
        where: {
          status: {
            notIn: ['pending']
          },
          expiresAt: {
            not: null
          }
        },
        data: {
          expiresAt: null,
          updatedAt: now
        }
      });

      // Clear transaction expiration dates for non-created/pending transactions
      const clearedTransactions = await prisma.transaction.updateMany({
        where: {
          status: {
            notIn: ['created', 'pending']
          },
          expiresAt: {
            not: null
          }
        },
        data: {
          expiresAt: null,
          updatedAt: now
        }
      });

      if (clearedPayments.count > 0 || clearedTransactions.count > 0) {        
        console.log(`[CLEAR_EXPIRED_DATES] Cleared expiration dates for ${clearedPayments.count} payments and ${clearedTransactions.count} transactions`);
      }
    } catch (error: any) {
      console.error('[CLEAR_EXPIRED_DATES] Error:', error);
    }
  }

  /**
   * Check if payment is expired (real-time check)
   */
  static isPaymentExpired(payment: { expiresAt: Date | null, status: string }): boolean {
    if (!payment.expiresAt) return false;
    if (payment.status !== 'pending') return false;
    return new Date() > payment.expiresAt;
  }
  /**
   * Check if transaction is expired (real-time check)
   */
  static isTransactionExpired(transaction: { expiresAt: Date | null, status: string }): boolean {
    if (!transaction.expiresAt) return false;
    if (!['created', 'pending'].includes(transaction.status)) return false;
    return new Date() > transaction.expiresAt;
  }

  /**
   * Get valid transaction status transitions
   */
  static getValidStatusTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      'created': ['pending', 'cancelled', 'expired'],
      'pending': ['in_progress', 'cancelled', 'expired'],
      'in_progress': ['success', 'cancelled'],
      'success': [], // Terminal state
      'cancelled': [], // Terminal state  
      'expired': [] // Terminal state
    };
    
    return transitions[currentStatus] || [];
  }

  /**
   * Update transaction status with validation
   */
  static async updateTransactionStatus(
    transactionId: string,
    newStatus: string,
    userId?: string
  ) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },      
      include: { 
        payment: true,
        whatsappTransaction: { include: { whatsappPackage: true } }
      }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Validate status transition
    const validTransitions = this.getValidStatusTransitions(transaction.status);
    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${transaction.status} to ${newStatus}`);
    }

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    // Handle status-specific business logic
    if (newStatus === 'in_progress') {
      // Auto-activate WhatsApp services
      if (transaction.type === 'whatsapp_service' && transaction.whatsappTransaction) {
        await this.activateWhatsAppService(transaction);
      }
    }

    return updatedTransaction;
  }
  /**
   * Activate WhatsApp service after payment (create ServicesWhatsappCustomers record)
   */
  private static async activateWhatsAppService(transaction: any) {
    try {
      const { whatsappTransaction } = transaction;
      const duration = whatsappTransaction.duration;
      const packageId = whatsappTransaction.whatsappPackageId;
      const userId = transaction.userId;

      const existingService = await prisma.servicesWhatsappCustomers.findFirst({
        where: { customerId: userId, packageId }
      });

      const now = new Date();
      let newExpiredAt: Date;

      if (existingService && existingService.expiredAt > now) {
        // Extend existing subscription
        newExpiredAt = new Date(existingService.expiredAt);
        if (duration === 'year') {
          newExpiredAt.setFullYear(newExpiredAt.getFullYear() + 1);
        } else {
          newExpiredAt.setMonth(newExpiredAt.getMonth() + 1);
        }

        await prisma.servicesWhatsappCustomers.update({
          where: { id: existingService.id },
          data: { 
            expiredAt: newExpiredAt,
            status: 'active',
            activatedAt: new Date()
          }
        });
      } else {
        // Create new subscription
        newExpiredAt = new Date();
        if (duration === 'year') {
          newExpiredAt.setFullYear(newExpiredAt.getFullYear() + 1);
        } else {
          newExpiredAt.setMonth(newExpiredAt.getMonth() + 1);
        }

        await prisma.servicesWhatsappCustomers.create({
          data: { 
            customerId: userId, 
            packageId, 
            expiredAt: newExpiredAt,
            status: 'active',
            activatedAt: new Date()
          }
        });      }

      console.log(`[WHATSAPP_ACTIVATION] Activated service for user ${userId}, expires at ${newExpiredAt}`);
    } catch (error) {
      console.error('[WHATSAPP_ACTIVATION] Error:', error);
      // Don't throw - let transaction stay in in_progress for manual handling
    }
  }  /**
   * Auto-activate services when payment is paid and transaction is in-progress
   * Simplified for WhatsApp-only service
   */  
  static async autoActivateServices(transaction: any) {
    // Check if activation is already in progress for this transaction
    if (this.isActivationLocked(transaction.id)) {
      console.log(`[AUTO_ACTIVATION] Transaction ${transaction.id} activation already in progress, skipping`);
      return;
    }

    // Lock activation for this transaction
    this.lockActivation(transaction.id);

    try {
      const hasWhatsapp = transaction.whatsappTransaction?.whatsappPackage;

      let whatsappActivated = false;

      // Auto-activate WhatsApp service if present (full automation)
      if (hasWhatsapp) {
        const result = await this.activateWhatsAppServiceForTransaction(transaction);
        whatsappActivated = result.success;
      } else {
        console.log(`[AUTO_ACTIVATION] Transaction ${transaction.id} has no WhatsApp service to activate`);
      }

      // Check if transaction should be completed
      await this.checkTransactionCompletion(transaction.id);

      console.log(`[AUTO_ACTIVATION] Transaction ${transaction.id} completed - WhatsApp: ${whatsappActivated ? 'Activated' : 'Failed or Not Present'}`);
    } catch (error) {
      console.error(`[AUTO_ACTIVATION] Error processing transaction ${transaction.id}:`, error);
      // Don't throw - let transaction stay in in_progress for manual handling
    } finally {
      // Always unlock activation
      this.unlockActivation(transaction.id);
      console.log(`[AUTO_ACTIVATION] Released lock for transaction ${transaction.id}`);
    }
  }
  /**
   * Activate WhatsApp service for a transaction
   */
  private static async activateWhatsAppServiceForTransaction(transaction: any) {
    if (!transaction.whatsappTransaction?.whatsappPackageId) {
      return { success: false, reason: 'No WhatsApp package found' };
    }

    // Check if this WhatsApp transaction has already been processed
    if (transaction.whatsappTransaction.status === 'success') {
      console.log(`[WHATSAPP_ACTIVATION] Transaction ${transaction.id} already processed, skipping`);
      return { success: true, reason: 'Already processed' };
    }

    const { whatsappTransaction } = transaction;
    const duration = whatsappTransaction.duration;
    const packageId = whatsappTransaction.whatsappPackageId;
    const userId = transaction.userId;

    try {
      // First, mark the WhatsApp transaction as 'processing' to prevent concurrent activation
      const updateResult = await prisma.transactionWhatsappService.updateMany({
        where: { 
          id: whatsappTransaction.id,
          status: { notIn: ['success', 'failed'] } // Only update if not already processed
        },
        data: { status: 'processing' }
      });

      // If no rows were updated, it means transaction was already processed
      if (updateResult.count === 0) {
        console.log(`[WHATSAPP_ACTIVATION] Transaction ${transaction.id} already processed by another request, skipping`);
        return { success: true, reason: 'Already processed by another request' };
      }

      // Note: ServicesWhatsappCustomers doesn't have transactionId field
      // Check if there's already an active service for this customer and package
      // This prevents duplicate activations but allows extending existing services

      const existingService = await prisma.servicesWhatsappCustomers.findFirst({
        where: { customerId: userId, packageId }
      });

      const now = new Date();
      let newExpiredAt: Date;

      if (existingService && existingService.expiredAt > now) {
        // Extend existing subscription
        newExpiredAt = new Date(existingService.expiredAt);
        if (duration === 'year') {
          newExpiredAt.setFullYear(newExpiredAt.getFullYear() + 1);
        } else {
          newExpiredAt.setMonth(newExpiredAt.getMonth() + 1);
        }

        await prisma.servicesWhatsappCustomers.update({
          where: { id: existingService.id },
          data: { 
            expiredAt: newExpiredAt,
            status: 'active',
            activatedAt: new Date(),
            updatedAt: new Date()
          }
        });

        console.log(`[WHATSAPP_SERVICE] Extended subscription for user ${userId} from ${existingService.expiredAt} to ${newExpiredAt} (Transaction: ${transaction.id})`);
      } else {
        // Create new subscription or handle if exists (race condition protection)
        newExpiredAt = new Date();
        if (duration === 'year') {
          newExpiredAt.setFullYear(newExpiredAt.getFullYear() + 1);
        } else {
          newExpiredAt.setMonth(newExpiredAt.getMonth() + 1);
        }

        try {
          await prisma.servicesWhatsappCustomers.create({
            data: { 
              customerId: userId, 
              packageId, 
              expiredAt: newExpiredAt,
              status: 'active',
              activatedAt: new Date()
            }
          });
          
          console.log(`[WHATSAPP_SERVICE] Created new subscription for user ${userId}, expires at ${newExpiredAt} (Transaction: ${transaction.id})`);
        } catch (createError: any) {
          // Handle unique constraint error - likely race condition
          if (createError.code === 'P2002' && createError.meta?.target?.includes('customerId_packageId')) {
            console.log(`[WHATSAPP_SERVICE] Unique constraint error, attempting to extend existing subscription for user ${userId}`);
            
            // Get the existing service and extend it
            const existingServiceAfterError = await prisma.servicesWhatsappCustomers.findFirst({
              where: { customerId: userId, packageId }
            });
            
            if (existingServiceAfterError) {
              const extendedExpiredAt = new Date(existingServiceAfterError.expiredAt);
              if (duration === 'year') {
                extendedExpiredAt.setFullYear(extendedExpiredAt.getFullYear() + 1);
              } else {
                extendedExpiredAt.setMonth(extendedExpiredAt.getMonth() + 1);
              }
              
              await prisma.servicesWhatsappCustomers.update({
                where: { id: existingServiceAfterError.id },
                data: { 
                  expiredAt: extendedExpiredAt,
                  status: 'active',
                  activatedAt: new Date(),
                  updatedAt: new Date()
                }
              });
              
              newExpiredAt = extendedExpiredAt;
              console.log(`[WHATSAPP_SERVICE] Extended subscription for user ${userId} after race condition from ${existingServiceAfterError.expiredAt} to ${newExpiredAt} (Transaction: ${transaction.id})`);
            } else {
              throw createError; // Re-throw if we can't find the conflicting record
            }
          } else {
            throw createError; // Re-throw other errors
          }
        }
      }

      // Mark WhatsApp transaction as success
      await prisma.transactionWhatsappService.update({
        where: { id: whatsappTransaction.id },
        data: { 
          status: 'success',
          startDate: now,
          endDate: newExpiredAt
        },
      });

      // Check if transaction should be completed after WhatsApp activation
      await this.checkTransactionCompletion(transaction.id);

      console.log(`[WHATSAPP_SERVICE] Service activated for user ${userId}, expires at ${newExpiredAt} (Transaction: ${transaction.id})`);
      return { success: true, expiredAt: newExpiredAt };
    } catch (error: any) {
      console.error('[WHATSAPP_ACTIVATION] Error:', error);
      
      // Mark WhatsApp transaction as failed
      try {
        await prisma.transactionWhatsappService.update({
          where: { id: whatsappTransaction.id },
          data: { status: 'failed' },
        });
      } catch (updateError) {
        console.error('[WHATSAPP_ACTIVATION] Failed to mark transaction as failed:', updateError);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Manual activation check for transactions that are in-progress with paid payment
   */
  static async checkAndActivateTransaction(transactionId: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: transactionId,
        userId: userId,
        status: 'in_progress'
      },
      include: {
        payment: true,
        whatsappTransaction: {
          include: { whatsappPackage: true }
        }
      }
    });

    if (!transaction) {
      throw new Error('Transaction not found or not in valid status for activation');
    }

    if (!transaction.payment || transaction.payment.status !== 'paid') {
      throw new Error('Transaction payment is not paid');
    }

    // Activate services
    await this.autoActivateServices(transaction);

    return {
      success: true,
      transaction: transaction
    };
  }

  /**
   * Manual activation method that can be called after admin payment update
   * This prevents double activation during the main payment update flow
   */
  static async activateServicesAfterPaymentUpdate(transactionId: string) {
    // Check if activation is already in progress for this transaction
    if (this.isActivationLocked(transactionId)) {
      console.log(`[MANUAL_ACTIVATION] Transaction ${transactionId} activation already in progress, skipping`);
      return { success: false, reason: 'Activation already in progress' };
    }

    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          payment: true,
          whatsappTransaction: {
            include: { whatsappPackage: true }
          }
        }
      });

      if (!transaction) {
        console.log(`[MANUAL_ACTIVATION] Transaction ${transactionId} not found`);
        return { success: false, reason: 'Transaction not found' };
      }

      if (transaction.status !== 'in_progress') {
        console.log(`[MANUAL_ACTIVATION] Transaction ${transactionId} status is ${transaction.status}, expected in_progress`);
        return { success: false, reason: 'Transaction not in progress' };
      }

      if (!transaction.payment || transaction.payment.status !== 'paid') {
        console.log(`[MANUAL_ACTIVATION] Transaction ${transactionId} payment is not paid`);
        return { success: false, reason: 'Payment not paid' };
      }

      // Additional check: If WhatsApp transaction already processed, skip activation
      if (transaction.whatsappTransaction && transaction.whatsappTransaction.status === 'success') {
        console.log(`[MANUAL_ACTIVATION] WhatsApp transaction ${transactionId} already processed, skipping`);
        return { success: true, reason: 'WhatsApp transaction already processed' };
      }

      // Activate services using the same method with lock protection
      await this.autoActivateServices(transaction);

      console.log(`[MANUAL_ACTIVATION] Successfully activated services for transaction ${transactionId}`);
      return { success: true, transactionId };

    } catch (error: any) {
      console.error(`[MANUAL_ACTIVATION] Error activating services for transaction ${transactionId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if transaction should be completed based on delivery/activation status
   */
  static async checkTransactionCompletion(transactionId: string) {
    try {      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          whatsappTransaction: true,
          payment: true
        }
      });

      if (!transaction || transaction.status !== 'in_progress') {
        return { completed: false, reason: 'Transaction not found or not in progress' };
      }

      const hasWhatsapp = transaction.whatsappTransaction?.whatsappPackageId;
      
      // Check WhatsApp activation status
      const whatsappCompleted = hasWhatsapp ? await this.isWhatsAppActivated(transaction.userId, transaction.whatsappTransaction?.whatsappPackageId) : true;

      // Transaction is complete when WhatsApp service is activated
      if (whatsappCompleted) {
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { 
            status: 'success', 
            updatedAt: new Date() 
          }
        });

        console.log(`[TRANSACTION_COMPLETION] Transaction ${transactionId} completed - WhatsApp: ${whatsappCompleted}`);
        return { completed: true };
      }

      console.log(`[TRANSACTION_COMPLETION] Transaction ${transactionId} not yet complete - WhatsApp: ${whatsappCompleted}`);
      return { completed: false, whatsappCompleted };

    } catch (error: any) {
      console.error('[TRANSACTION_COMPLETION] Error:', error);
      return { completed: false, error: error.message };
    }
  }

  /**
   * Check if WhatsApp service is activated for a user and package
   */
  private static async isWhatsAppActivated(userId: string, packageId?: string): Promise<boolean> {
    if (!packageId) return false;
    
    const whatsappService = await prisma.servicesWhatsappCustomers.findFirst({
      where: { 
        customerId: userId,
        packageId: packageId,
        status: 'active',
        expiredAt: { gt: new Date() } // Must be active (not expired)
      }
    });    return !!whatsappService;
  }

  /**
   * Manual trigger for add-ons delivery completion (called by admin)
   */
  static async completeAddonsDelivery(transactionId: string, adminUserId?: string) {
    console.warn('[DEPRECATED] completeAddonsDelivery - Addons removed from system');
    return { success: false, error: 'Addons feature removed - WhatsApp API only' };
  }

  /**
   * Update child transaction statuses (TransactionProduct and TransactionAddons)
   */
  static async updateChildTransactionStatuses(
    transactionId: string, 
    status: 'created' | 'pending' | 'in_progress' | 'success' | 'cancelled'
  ) {
    console.warn('[DEPRECATED] updateChildTransactionStatuses - Products/Addons removed from system');
    // No-op since child transactions (products/addons) are removed
  }

}
