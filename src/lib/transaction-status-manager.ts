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

            // Update all child transactions to 'in_progress'
            await Promise.all([
            // Update product transactions
            prisma.transactionProduct.updateMany({
                where: { transactionId },
                data: { status: 'in_progress' }
            }),
            
            // Update addon transactions
            prisma.transactionAddons.updateMany({
                where: { transactionId },
                data: { status: 'in_progress' }
            }),
            
            // Update whatsapp transaction
            prisma.transactionWhatsappService.updateMany({
                where: { transactionId },
                data: { status: 'in_progress' }
            })
            ]);

            // Create delivery records when transactions become in_progress
            await this.createDeliveryRecords(transactionId);
            
            // Activate WhatsApp service if transaction has WhatsApp component
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
            
            // Check if transaction has WhatsApp component (regardless of type)
            if (transaction && transaction.whatsappTransaction) {
                console.log(`[TRANSACTION_STATUS_MANAGER] Transaction ${transactionId} has WhatsApp component, activating service`);
                await this.activateWhatsAppService(transaction);
            } else {
                console.log(`[TRANSACTION_STATUS_MANAGER] Transaction ${transactionId} has no WhatsApp component, skipping WhatsApp activation`);
            }
        }
        } catch (error) {
        console.error('Error updating transaction on payment:', error);
        throw error;
        }
    }

    /**
     * Create delivery records when transactions become in_progress
     */
    static async createDeliveryRecords(transactionId: string) {
        try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
            productTransactions: {
                include: { package: true }
            },
            addonTransactions: {
                include: { addon: true }
            },
            whatsappTransaction: true
            }
        });

        if (!transaction) return;

        const promises = [];

        // Create product delivery records
        if (transaction.productTransactions.length > 0) {
            for (const productTx of transaction.productTransactions) {
            const existingDelivery = await prisma.servicesProductCustomers.findFirst({
                where: { 
                transactionId: transaction.id,
                customerId: transaction.userId 
                }
            });

            if (!existingDelivery) {
                promises.push(
                prisma.servicesProductCustomers.create({
                    data: {
                    transactionId: transaction.id,
                    customerId: transaction.userId,
                    packageId: productTx.packageId,
                    quantity: productTx.quantity,
                    status: 'pending' // Changed from 'awaiting_delivery' to 'pending'
                    }
                })
                );
            }
            }
        }

        // Create addon delivery records
        if (transaction.addonTransactions.length > 0) {
            const existingAddonDelivery = await prisma.servicesAddonsCustomers.findFirst({
            where: { 
                transactionId: transaction.id,
                customerId: transaction.userId 
            }
            });

            if (!existingAddonDelivery) {
            const addonDetails = transaction.addonTransactions.map(addonTx => ({
                addonId: addonTx.addonId,
                quantity: addonTx.quantity,
                name: addonTx.addon.name_en,
                price: addonTx.addon.price_idr
            }));

            promises.push(
                prisma.servicesAddonsCustomers.create({
                data: {
                    transactionId: transaction.id,
                    customerId: transaction.userId,
                    addonDetails: JSON.stringify(addonDetails),
                    status: 'pending' // Changed from 'awaiting_delivery' to 'pending'
                }
                })
            );
            }
        }

        // For WhatsApp, the existing flow is correct, don't change it
        // WhatsApp delivery is handled separately in whatsapp-activation.ts

        await Promise.all(promises);
        } catch (error) {
        console.error('Error creating delivery records:', error);
        throw error;
        }
    }

    /**
     * Update child transaction status when delivery is completed
     * Then check if all child transactions are 'success' to update main transaction
     */
    static async updateChildTransactionStatus(
        transactionId: string,
        childType: 'product' | 'addon' | 'whatsapp',
        childId?: string
    ) {
        try {
        console.log(`[CHILD_STATUS_UPDATE] Updating ${childType} transaction status to success for transaction ${transactionId}`);

        // Update specific child transaction to 'success'
        switch (childType) {
            case 'product':
            await prisma.transactionProduct.updateMany({
                where: { 
                transactionId,
                ...(childId ? { id: childId } : {})
                },
                data: { status: 'success' }
            });
            break;
            
            case 'addon':
            await prisma.transactionAddons.updateMany({
                where: { 
                transactionId,
                ...(childId ? { id: childId } : {})
                },
                data: { status: 'success' }
            });
            break;
            
            case 'whatsapp':
            await prisma.transactionWhatsappService.updateMany({
                where: { transactionId },
                data: { status: 'success' }
            });
            break;
        }

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
            productTransactions: true,
            addonTransactions: true,
            whatsappTransaction: true
            }
        });

        if (!transaction) return;

        // Check if all child transactions are 'success'
        const allProductsSuccess = transaction.productTransactions.length === 0 || 
            transaction.productTransactions.every(pt => pt.status === 'success');
            
        const allAddonsSuccess = transaction.addonTransactions.length === 0 || 
            transaction.addonTransactions.every(at => at.status === 'success');
            
        // For WhatsApp: Check if transaction exists and status is 'success'
        // If there's no WhatsApp transaction, consider it as success (product/addon only transaction)
        const whatsappSuccess = !transaction.whatsappTransaction || 
            transaction.whatsappTransaction.status === 'success';

        console.log(`[TRANSACTION_COMPLETION] Checking transaction ${transactionId} completion status:`, {
            hasProducts: transaction.productTransactions.length > 0,
            hasAddons: transaction.addonTransactions.length > 0,
            hasWhatsapp: !!transaction.whatsappTransaction,
            allProductsSuccess,
            allAddonsSuccess,
            whatsappSuccess,
            whatsappStatus: transaction.whatsappTransaction?.status
        });

        // If all child transactions are success, update main transaction
        if (allProductsSuccess && allAddonsSuccess && whatsappSuccess) {
            await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'success' }
            });
            
            console.log(`[TRANSACTION_COMPLETION] ✅ Transaction ${transactionId} marked as success - Products: ${allProductsSuccess}, Addons: ${allAddonsSuccess}, WhatsApp: ${whatsappSuccess}`);
        } else {
            console.log(`[TRANSACTION_COMPLETION] ⏳ Transaction ${transactionId} not yet complete - Products: ${allProductsSuccess}, Addons: ${allAddonsSuccess}, WhatsApp: ${whatsappSuccess}`);
        }
        } catch (error) {
        console.error('Error checking main transaction status:', error);
        throw error;
        }
    }

    /**
     * Update transaction status to 'pending' when payment is created
     */
    static async updateTransactionOnPaymentCreation(transactionId: string) {
        try {
        // Update main transaction to 'pending'
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'pending' }
        });

        // Update all child transactions to 'pending'
        await Promise.all([
            prisma.transactionProduct.updateMany({
            where: { transactionId },
            data: { status: 'pending' }
            }),
            
            prisma.transactionAddons.updateMany({
            where: { transactionId },
            data: { status: 'pending' }
            }),
            
            prisma.transactionWhatsappService.updateMany({
            where: { transactionId },
            data: { status: 'pending' }
            })
        ]);
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
     * Cancel transaction and all child transactions
     */
    static async cancelTransaction(transactionId: string) {
        console.log(`[TRANSACTION_CANCELLATION] Starting cancellation for transaction ${transactionId}`);

        try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
            productTransactions: true,
            addonTransactions: true,
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

        // Cancel product transactions
        if (transaction.productTransactions.length > 0) {
            promises.push(
            prisma.transactionProduct.updateMany({
                where: { transactionId },
                data: { status: 'cancelled' }
            })
            );
        }

        // Cancel addon transactions
        if (transaction.addonTransactions.length > 0) {
            promises.push(
            prisma.transactionAddons.updateMany({
                where: { transactionId },
                data: { status: 'cancelled' }
            })
            );
        }

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

        // Note: We don't cancel delivery records as they are only created after payment is paid
        // If transaction is cancelled before payment, delivery records don't exist yet

        await Promise.all(promises);

        console.log(`[TRANSACTION_CANCELLATION] Successfully cancelled transaction ${transactionId} and all child transactions`);
        } catch (error) {
        console.error(`[TRANSACTION_CANCELLATION] Error cancelling transaction ${transactionId}:`, error);
        throw error;
        }
    }
}
