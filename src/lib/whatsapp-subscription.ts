import { prisma } from "@/lib/prisma";

/**
 * Update expired subscriptions status to expired
 * @param userId - The user ID to update (optional, if not provided updates all users)
 * @returns Promise<number> - Number of subscriptions updated
 */
export async function updateExpiredSubscriptions(userId?: string): Promise<number> {
  try {
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999); // Set to end of today for proper comparison
    
    const whereCondition: any = {
      status: "active", // Only update currently active subscriptions
      expiredAt: {
        lte: currentDate // Expired today or before
      }
    };

    // If userId provided, only update for that user
    if (userId) {
      whereCondition.customerId = userId;
    }

    const result = await prisma.servicesWhatsappCustomers.updateMany({
      where: whereCondition,
      data: {
        status: "expired" // Change status to expired for expired subscriptions
      }
    });

    return result.count;
  } catch (error) {
    console.error('[WHATSAPP_SUBSCRIPTION] Error updating expired subscriptions:', error);
    return 0;
  }
}

/**
 * Check if a user has an active WhatsApp subscription
 * @param userId - The user ID to check
 * @returns Promise<boolean> - True if user has active subscription, false otherwise
 */
export async function hasActiveWhatsAppSubscription(userId: string): Promise<boolean> {
  try {
    // First, update any expired subscriptions for this user
    await updateExpiredSubscriptions(userId);

    // Check for active WhatsApp subscription using new schema
    const activeSubscription = await prisma.servicesWhatsappCustomers.findFirst({
      where: {
        customerId: userId,
        status: "active",
        expiredAt: {
          gt: new Date() // End date is in the future
        }
      }
    });

    if (activeSubscription) {
      return true;
    }

    // Check new system (TransactionWhatsappService) as fallback
    const newSystemSubscription = await prisma.transactionWhatsappService.findFirst({
      where: {
        transaction: {
          userId: userId,
          status: "success" // Changed from "paid" to "success"
        },
        status: "success",
        endDate: {
          gt: new Date() // End date is in the future
        }
      }
    });

    if (newSystemSubscription) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('[WHATSAPP_SUBSCRIPTION] Error checking subscription:', error);
    return false;
  }
}

/**
 * Get user's active WhatsApp subscription details (returns the highest session limit package)
 * @param userId - The user ID to check
 * @returns Promise<object | null> - Subscription details or null if no active subscription
 */
export async function getActiveWhatsAppSubscription(userId: string) {
  try {
    // First, update any expired subscriptions for this user
    await updateExpiredSubscriptions(userId);

    // Check ServicesWhatsappCustomers (primary system) - get ALL active subscriptions
    const activeSubscriptions = await prisma.servicesWhatsappCustomers.findMany({
      where: {
        customerId: userId,
        status: "active",
        expiredAt: {
          gt: new Date() // End date is in the future
        }
      },
      include: {
        package: true
      },
      orderBy: [
        { package: { maxSession: 'desc' } }, // Order by session limit descending (highest first)
        { expiredAt: 'desc' } // Then by expiration date if same session limit
      ]
    });

    // Return the subscription with highest session limit
    if (activeSubscriptions.length > 0) {
      const bestSubscription = activeSubscriptions[0];
      // console.log(`[WHATSAPP_SUBSCRIPTION] User ${userId} has ${activeSubscriptions.length} active subscriptions, using package "${bestSubscription.package.name}" with ${bestSubscription.package.maxSession} max sessions`);
      return bestSubscription;
    }

    // Check new system (TransactionWhatsappService) as fallback
    const newSystemSubscriptions = await prisma.transactionWhatsappService.findMany({
      where: {
        transaction: {
          userId: userId,
          status: "success"
        },
        status: "success",
        endDate: {
          gt: new Date() // End date is in the future
        }
      },
      include: {
        whatsappPackage: true,
        transaction: true
      },
      orderBy: [
        { whatsappPackage: { maxSession: 'desc' } }, // Order by session limit descending
        { endDate: 'desc' } // Then by expiration date
      ]
    });

    if (newSystemSubscriptions.length > 0) {
      const bestSubscription = newSystemSubscriptions[0];
      // console.log(`[WHATSAPP_SUBSCRIPTION] User ${userId} has ${newSystemSubscriptions.length} active transaction subscriptions, using package "${bestSubscription.whatsappPackage.name}" with ${bestSubscription.whatsappPackage.maxSession} max sessions`);
      return bestSubscription;
    }

    return null;
  } catch (error) {
    console.error('[WHATSAPP_SUBSCRIPTION] Error getting subscription:', error);
    return null;
  }
}

/**
 * Get user's WhatsApp subscription status and limits
 * @param userId - The user ID to check
 * @returns Promise<object> - Subscription status and session limits
 */
export async function getWhatsAppSubscriptionStatus(userId: string) {
  try {
    const subscription = await getActiveWhatsAppSubscription(userId);
    
    if (!subscription) {
      return {
        hasActiveSubscription: false,
        maxSessions: 0,
        currentSessions: 0,
        packageName: null,
        endDate: null,
        canCreateMoreSessions: false
      };
    }

    // Count current sessions
    const currentSessions = await prisma.whatsAppSession.count({
      where: { userId }
    });

    // Handle both systems
    let maxSessions: number;
    let packageName: string;
    let endDate: Date | null;

    if ('whatsappPackage' in subscription) {
      // New system (TransactionWhatsappService)
      maxSessions = subscription.whatsappPackage.maxSession;
      packageName = subscription.whatsappPackage.name;
      endDate = subscription.endDate;
    } else {
      // Current system (ServicesWhatsappCustomers)
      maxSessions = subscription.package.maxSession;
      packageName = subscription.package.name;
      endDate = subscription.expiredAt;
    }

    return {
      hasActiveSubscription: true,
      maxSessions,
      currentSessions,
      packageName,
      endDate,
      canCreateMoreSessions: currentSessions < maxSessions
    };
  } catch (error) {
    console.error('[WHATSAPP_SUBSCRIPTION] Error getting subscription status:', error);
    return {
      hasActiveSubscription: false,
      maxSessions: 0,
      currentSessions: 0,
      packageName: null,
      endDate: null,
      canCreateMoreSessions: false
    };
  }
}

/**
 * Get all active WhatsApp subscriptions for a user (for debugging and monitoring)
 * @param userId - The user ID to check
 * @returns Promise<array> - All active subscriptions with package details
 */
export async function getAllActiveWhatsAppSubscriptions(userId: string) {
  try {
    await updateExpiredSubscriptions();

    // Check new system (ServicesWhatsappCustomers) first
    const primarySubscriptions = await prisma.servicesWhatsappCustomers.findMany({
      where: {
        customerId: userId,
        status: "active",
        expiredAt: {
          gt: new Date() // Expiration date is in the future
        }
      },
      include: {
        package: true,
        customer: true
      },
      orderBy: [
        { package: { maxSession: 'desc' } }, // Order by session limit descending
        { expiredAt: 'desc' } // Then by expiration date
      ]
    });

    // Check old system (TransactionWhatsappService) for active packages
    const fallbackSubscriptions = await prisma.transactionWhatsappService.findMany({
      where: {
        transaction: {
          userId: userId,
          status: "success"
        },
        status: "success",
        endDate: {
          gt: new Date() // End date is in the future
        }
      },
      include: {
        whatsappPackage: true,
        transaction: true
      },
      orderBy: [
        { whatsappPackage: { maxSession: 'desc' } }, // Order by session limit descending
        { endDate: 'desc' } // Then by expiration date
      ]
    });

    return {
      primary: primarySubscriptions,
      fallback: fallbackSubscriptions,
      total: primarySubscriptions.length + fallbackSubscriptions.length,
      activePackages: [
        ...primarySubscriptions.map(sub => ({
          type: 'primary',
          packageName: sub.package.name,
          maxSessions: sub.package.maxSession,
          endDate: sub.expiredAt,
          packageId: sub.packageId
        })),
        ...fallbackSubscriptions.map(sub => ({
          type: 'fallback',
          packageName: sub.whatsappPackage.name,
          maxSessions: sub.whatsappPackage.maxSession,
          endDate: sub.endDate,
          transactionId: sub.transactionId
        }))
      ]
    };
  } catch (error) {
    console.error('[WHATSAPP_SUBSCRIPTION] Error getting all active subscriptions:', error);
    return {
      primary: [],
      fallback: [],
      total: 0,
      activePackages: []
    };
  }
}
