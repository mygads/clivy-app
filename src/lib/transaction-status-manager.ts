import { prisma } from './prisma';

export class TransactionStatusManager {
    /**
     * Update transaction status based on payment status
     * When payment is 'paid', all child transactions (product/addon/whatsapp) become 'in_progress'
     */
    static async updateTransactionOnPayment(transactionId: string, paymentStatus: string) {
        try {
        if (paymentStatus === 'paid') {
            // Update main transaction to 'in_progress'
            await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'in_progress' }
            });

            // Update WhatsApp transaction to 'in_progress'
            await prisma.transactionWhatsappService.updateMany({
                where: { transactionId },
                data: { status: 'in_progress' }
            });

            // Activate WhatsApp service immediately
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    whatsappTransaction: {
                        include: {
                            whatsappPackage: true,
                        },
                    },
                },
            });
            
            if (transaction && transaction.whatsappTransaction) {
                console.log(`[TRANSACTION_STATUS_MANAGER] Transaction ${transactionId} has WhatsApp component, activating service`);
                await this.activateWhatsAppService(transaction);
            } else {
                console.log(`[TRANSACTION_STATUS_MANAGER] Transaction ${transactionId} has no WhatsApp component`);
            }
        }
        } catch (error) {
        console.error('Error updating transaction on payment:', error);
        throw error;
        }
    }

    /**
     * Create delivery records when transactions become in_progress
     * Simplified - WhatsApp only
     */
    static async createDeliveryRecords(transactionId: string) {
        try {
        console.log(`[DELIVERY_RECORDS] WhatsApp service activation handled separately, no additional delivery records needed for transaction ${transactionId}`);
        // WhatsApp delivery is handled directly in activateWhatsAppService
        // No additional records needed
        } catch (error) {
        console.error('Error creating delivery records:', error);
        throw error;
        }
    }

    /**
     * Update child transaction status when delivery is completed
     * Simplified - WhatsApp only
     */
    static async updateChildTransactionStatus(
        transactionId: string,
        childType: 'whatsapp',
        childId?: string
    ) {
        try {
        console.log(`[CHILD_STATUS_UPDATE] Updating ${childType} transaction status to success for transaction ${transactionId}`);

        // Update WhatsApp transaction to 'success'
        await prisma.transactionWhatsappService.updateMany({
            where: { transactionId },
            data: { status: 'success' }
        });

        console.log(`[CHILD_STATUS_UPDATE] ✅ Successfully updated ${childType} transaction status to success`);
        
        // Check if all child transactions are 'success' after this update
        await this.checkAndUpdateMainTransactionStatus(transactionId);
        } catch (error) {
        console.error(`[CHILD_STATUS_UPDATE] Error updating ${childType} transaction status:`, error);
        throw error;
        }
    }

    /**
     * Check if all child transactions are 'success' and update main transaction accordingly
     */
    static async checkAndUpdateMainTransactionStatus(transactionId: string) {
        try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
            whatsappTransaction: true
            }
        });

        if (!transaction) return;

        // Check if WhatsApp transaction is 'success'
        const whatsappSuccess = transaction.whatsappTransaction?.status === 'success';

        console.log(`[TRANSACTION_COMPLETION] Checking transaction ${transactionId} completion status:`, {
            hasWhatsapp: !!transaction.whatsappTransaction,
            whatsappSuccess,
            whatsappStatus: transaction.whatsappTransaction?.status
        });

        // If WhatsApp transaction is success, update main transaction
        if (whatsappSuccess) {
            await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'success' }
            });
            
            console.log(`[TRANSACTION_COMPLETION] ✅ Transaction ${transactionId} marked as success - WhatsApp: ${whatsappSuccess}`);
        } else {
            console.log(`[TRANSACTION_COMPLETION] ⏳ Transaction ${transactionId} not yet complete - WhatsApp: ${whatsappSuccess}`);
        }
        } catch (error) {
        console.error('Error checking main transaction status:', error);
        throw error;
        }
    }

    /**
     * Update transaction status to 'pending' when payment is created - Simplified
     */
    static async updateTransactionOnPaymentCreation(transactionId: string) {
        try {
        // Update main transaction to 'pending'
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'pending' }
        });

        // Update WhatsApp transaction to 'pending'
        await prisma.transactionWhatsappService.updateMany({
            where: { transactionId },
            data: { status: 'pending' }
        });
        } catch (error) {
        console.error('Error updating transaction on payment creation:', error);
        throw error;
        }
    }

    /**
     * Activate WhatsApp service after successful payment
     */
    static async activateWhatsAppService(transaction: any) {
        // Check if transaction has WhatsApp component (regardless of transaction type)
        if (!transaction.whatsappTransaction?.whatsappPackageId) {
            console.log(`[WHATSAPP_ACTIVATION] Transaction ${transaction.id} has no WhatsApp component, skipping`);
            return;
        }

        // Check if this WhatsApp transaction has already been processed
        if (transaction.whatsappTransaction.status === 'success') {
            console.log(`[WHATSAPP_ACTIVATION] Transaction ${transaction.id} already processed, skipping`);
            return;
        }

        const duration = transaction.whatsappTransaction.duration;
        const packageId = transaction.whatsappTransaction.whatsappPackageId;
        const userId = transaction.userId;

        try {
            console.log(`[WHATSAPP_ACTIVATION] Starting activation for user ${userId}, package ${packageId}, duration ${duration}`);
            console.log(`[WHATSAPP_ACTIVATION] Transaction type: ${transaction.type}, has WhatsApp: true`);

            // Check if user has existing subscription for the same package
            const existingSubscription = await prisma.servicesWhatsappCustomers.findUnique({
                where: {
                    customerId_packageId: {
                        customerId: userId,
                        packageId: packageId,
                    }
                },
                include: {
                    package: true,
                },
            });

            const now = new Date();
            let newExpiredAt: Date;

            if (existingSubscription) {
                // Same package - extend expiry date
                console.log(`[WHATSAPP_ACTIVATION] User ${userId} has existing subscription for same package, extending duration`);
                
                // Calculate new expiry date from current expiry (even if expired)
                const baseDate = existingSubscription.expiredAt > now ? existingSubscription.expiredAt : now;
                newExpiredAt = new Date(baseDate);
                
                if (duration === 'year') {
                    newExpiredAt.setFullYear(newExpiredAt.getFullYear() + 1);
                } else {
                    newExpiredAt.setMonth(newExpiredAt.getMonth() + 1);
                }

                // Update existing subscription - extend expiry and update subscription date
                await prisma.servicesWhatsappCustomers.update({
                    where: { id: existingSubscription.id },
                    data: { 
                        expiredAt: newExpiredAt,
                        status: 'active',
                        lastSubscriptionAt: now,
                        updatedAt: now
                    },
                });

                console.log(`[WHATSAPP_ACTIVATION] Extended same package subscription for user ${userId} until ${newExpiredAt}`);
            } else {
                // Different package or first subscription - create new record
                newExpiredAt = new Date();
                if (duration === 'year') {
                    newExpiredAt.setFullYear(newExpiredAt.getFullYear() + 1);
                } else {
                    newExpiredAt.setMonth(newExpiredAt.getMonth() + 1);
                }

                // Check if user has subscription for different package
                const otherPackageSubscription = await prisma.servicesWhatsappCustomers.findFirst({
                    where: {
                        customerId: userId,
                        packageId: { not: packageId },
                        status: 'active',
                        expiredAt: { gt: now }
                    }
                });

                if (otherPackageSubscription) {
                    console.log(`[WHATSAPP_ACTIVATION] User ${userId} has active subscription for different package, creating new record for package ${packageId}`);
                } else {
                    console.log(`[WHATSAPP_ACTIVATION] Creating first/new subscription for user ${userId} and package ${packageId}`);
                }

                // Create new subscription record
                await prisma.servicesWhatsappCustomers.create({
                    data: {
                        customerId: userId,
                        packageId: packageId,
                        expiredAt: newExpiredAt,
                        status: 'active',
                        activatedAt: now,
                        lastSubscriptionAt: now,
                    },
                });

                console.log(`[WHATSAPP_ACTIVATION] Created new subscription for user ${userId} until ${newExpiredAt}`);
            }

            // Mark WhatsApp transaction as success (don't update startDate/endDate as they're not used)
            await prisma.transactionWhatsappService.update({
                where: { id: transaction.whatsappTransaction.id },
                data: { 
                    status: 'success'
                },
            });

            console.log(`[WHATSAPP_ACTIVATION] ✅ Marked WhatsApp transaction ${transaction.whatsappTransaction.id} as success`);

            // Update child transaction status to trigger main transaction completion check
            await this.updateChildTransactionStatus(transaction.id, 'whatsapp');

            // Get package details for logging
            const packageDetails = existingSubscription?.package || await prisma.whatsappApiPackage.findUnique({
                where: { id: packageId },
            });

            if (packageDetails) {
                console.log(`[WHATSAPP_ACTIVATION] User ${userId} now has access to WhatsApp API "${packageDetails.name}" with max ${packageDetails.maxSession} sessions until ${newExpiredAt}`);
            }
        } catch (error) {
            console.error(`[WHATSAPP_ACTIVATION] ❌ Error activating WhatsApp service for transaction ${transaction.id}:`, error);
            
            // Mark WhatsApp transaction as failed
            try {
                await prisma.transactionWhatsappService.update({
                    where: { id: transaction.whatsappTransaction.id },
                    data: { status: 'failed' },
                });
                console.log(`[WHATSAPP_ACTIVATION] Marked transaction ${transaction.whatsappTransaction.id} as failed`);
            } catch (updateError) {
                console.error(`[WHATSAPP_ACTIVATION] Failed to mark transaction as failed:`, updateError);
            }
            
            throw error;
        }
    }

    /**
     * Cancel transaction and WhatsApp transaction - Simplified
     */
    static async cancelTransaction(transactionId: string) {
        console.log(`[TRANSACTION_CANCELLATION] Starting cancellation for transaction ${transactionId}`);

        try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
            whatsappTransaction: true,
            payment: true
            }
        });

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        const promises = [];

        // Cancel main transaction
        promises.push(
            prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'cancelled' }
            })
        );

        // Cancel WhatsApp transaction
        if (transaction.whatsappTransaction) {
            promises.push(
            prisma.transactionWhatsappService.update({
                where: { id: transaction.whatsappTransaction.id },
                data: { status: 'cancelled' }
            })
            );
        }

        // Cancel payment
        if (transaction.payment) {
            promises.push(
            prisma.payment.update({
                where: { id: transaction.payment.id },
                data: { status: 'cancelled' }
            })
            );
        }

        await Promise.all(promises);

        console.log(`[TRANSACTION_CANCELLATION] Successfully cancelled transaction ${transactionId} and all child transactions`);
        } catch (error) {
        console.error(`[TRANSACTION_CANCELLATION] Error cancelling transaction ${transactionId}:`, error);
        throw error;
        }
    }
}
