import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth, getCustomerAuthErrorResponse } from "@/lib/auth-helpers";
import { startOfDay, endOfDay, subDays } from 'date-fns'

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    // Get all user's WhatsApp sessions
    const sessions = await prisma.whatsAppSession.findMany({
      where: {
        userId: userAuth.id,
        isSystemSession: false
      },
      include: {
        whatsAppMessageStats: true
      }
    })

    // Get user's subscription details - prioritize highest price package
    const allSubscriptions = await prisma.servicesWhatsappCustomers.findMany({
      where: {
        customerId: userAuth.id,
        status: 'active',
        expiredAt: {
          gt: new Date() // Only active subscriptions
        }
      },
      include: {
        package: true
      }
    })

    // Find subscription with highest monthly price (most expensive package)
    const subscription = allSubscriptions.length > 0 
      ? allSubscriptions.reduce((highest, current) => {
          const currentPrice = current.package.priceMonth
          const highestPrice = highest.package.priceMonth
          return currentPrice > highestPrice ? current : highest
        })
      : null

    // Get user's campaigns
    const campaigns = await prisma.whatsAppCampaign.findMany({
      where: {
        user_id: userAuth.id,
        deleted_at: null
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    })

    // Get bulk campaigns with enhanced filtering
    const bulkCampaigns = await prisma.whatsAppBulkCampaign.findMany({
      where: {
        user_id: userAuth.id,
        deleted_at: null
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 20
    })

    // Calculate different campaign types
    const now = new Date()
    
    // Only scheduled campaigns (future scheduled)
    const scheduledCampaigns = bulkCampaigns.filter(campaign => 
      campaign.scheduled_at && new Date(campaign.scheduled_at) > now
    ).length
    
    // Successful campaigns
    const successfulCampaigns = bulkCampaigns.filter(campaign => 
      campaign.status === 'completed'
    ).length

    // Failed campaigns
    const failedCampaigns = bulkCampaigns.filter(campaign => 
      campaign.status === 'failed'
    ).length

    // Get recent WhatsApp transactions with enhanced details
    const whatsappTransactions = await prisma.transactionWhatsappService.findMany({
      where: {
        transaction: {
          userId: userAuth.id
        }
      },
      include: {
        transaction: {
          include: {
            payment: true,
            voucher: true
          }
        },
        whatsappPackage: true
      },
      orderBy: {
        startDate: 'desc'
      },
      take: 10
    })

    // Calculate session statistics - max sessions from highest price package only
    const activeSessions = sessions.filter(s => s.connected).length
    const maxSessions = subscription?.package?.maxSession || 0

    // Calculate message statistics across all sessions
    const totalMessageStats = sessions.reduce((acc, session) => {
      const stats = session.whatsAppMessageStats[0]
      if (stats) {
        acc.totalSent += stats.totalMessagesSent
        acc.totalFailed += stats.totalMessagesFailed
        acc.textSent += stats.textMessagesSent
        acc.textFailed += stats.textMessagesFailed
        acc.imageSent += stats.imageMessagesSent
        acc.imageFailed += stats.imageMessagesFailed
        acc.documentSent += stats.documentMessagesSent
        acc.documentFailed += stats.documentMessagesFailed
        acc.audioSent += stats.audioMessagesSent
        acc.audioFailed += stats.audioMessagesFailed
        acc.videoSent += stats.videoMessagesSent
        acc.videoFailed += stats.videoMessagesFailed
      }
      return acc
    }, {
      totalSent: 0,
      totalFailed: 0,
      textSent: 0,
      textFailed: 0,
      imageSent: 0,
      imageFailed: 0,
      documentSent: 0,
      documentFailed: 0,
      audioSent: 0,
      audioFailed: 0,
      videoSent: 0,
      videoFailed: 0
    })

    // Get weekly campaign data for charts (last 7 days)
    const weeklyData = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const startDate = startOfDay(date)
      const endDate = endOfDay(date)

      // Get bulk campaign items sent on this day
      const dailyItems = await prisma.whatsAppBulkCampaignItem.findMany({
        where: {
          sent_at: {
            gte: startDate,
            lte: endDate
          },
          WhatsAppBulkCampaigns: {
            user_id: userAuth.id,
            deleted_at: null
          }
        }
      })

      const sentToday = dailyItems.filter(item => item.status === 'sent').length
      const failedToday = dailyItems.filter(item => item.status === 'failed').length
      const uniquePhones = new Set(dailyItems.map(item => item.phone)).size

      weeklyData.push({
        date: date.toISOString().split('T')[0],
        sent: sentToday,
        failed: failedToday,
        contacts: uniquePhones
      })
    }

    // Get upcoming scheduled campaigns (next 30 days)
    const upcomingCampaigns = await prisma.whatsAppBulkCampaign.findMany({
      where: {
        user_id: userAuth.id,
        deleted_at: null,
        scheduled_at: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
        }
      },
      orderBy: {
        scheduled_at: 'asc'
      }
    })

    // Calculate total upcoming contacts
    const upcomingContacts = upcomingCampaigns.reduce((sum, campaign) => {
      return sum + Number(campaign.total_count || 0)
    }, 0)

    // Prepare session details with phone number extraction
    const sessionDetails = sessions.map(session => {
      const messageStats = session.whatsAppMessageStats[0] || {
        totalMessagesSent: 0,
        totalMessagesFailed: 0,
        textMessagesSent: 0,
        textMessagesFailed: 0,
        imageMessagesSent: 0,
        imageMessagesFailed: 0,
        documentMessagesSent: 0,
        documentMessagesFailed: 0,
        audioMessagesSent: 0,
        audioMessagesFailed: 0,
        videoMessagesSent: 0,
        videoMessagesFailed: 0,
        stickerMessagesSent: 0,
        stickerMessagesFailed: 0,
        locationMessagesSent: 0,
        locationMessagesFailed: 0,
        contactMessagesSent: 0,
        contactMessagesFailed: 0,
        templateMessagesSent: 0,
        templateMessagesFailed: 0,
        lastMessageSentAt: null,
        lastMessageFailedAt: null
      }

      // Extract phone number from jid (e.g., "6281234567890@s.whatsapp.net" -> "+6281234567890")
      let phoneNumber = null
      if (session.jid) {
        const match = session.jid.match(/^(\d+)@/)
        if (match) {
          phoneNumber = `+${match[1]}`
        }
      }

      return {
        id: session.id,
        sessionId: session.sessionId,
        sessionName: session.sessionName,
        jid: session.jid,
        connected: session.connected,
        status: session.status,
        phoneNumber,
        messageStats: {
          totalMessagesSent: messageStats.totalMessagesSent,
          totalMessagesFailed: messageStats.totalMessagesFailed,
          textMessagesSent: messageStats.textMessagesSent,
          textMessagesFailed: messageStats.textMessagesFailed,
          imageMessagesSent: messageStats.imageMessagesSent,
          imageMessagesFailed: messageStats.imageMessagesFailed,
          documentMessagesSent: messageStats.documentMessagesSent,
          documentMessagesFailed: messageStats.documentMessagesFailed,
          audioMessagesSent: messageStats.audioMessagesSent,
          audioMessagesFailed: messageStats.audioMessagesFailed,
          videoMessagesSent: messageStats.videoMessagesSent,
          videoMessagesFailed: messageStats.videoMessagesFailed,
          stickerMessagesSent: messageStats.stickerMessagesSent,
          stickerMessagesFailed: messageStats.stickerMessagesFailed,
          locationMessagesSent: messageStats.locationMessagesSent,
          locationMessagesFailed: messageStats.locationMessagesFailed,
          contactMessagesSent: messageStats.contactMessagesSent,
          contactMessagesFailed: messageStats.contactMessagesFailed,
          templateMessagesSent: messageStats.templateMessagesSent,
          templateMessagesFailed: messageStats.templateMessagesFailed,
          lastMessageSentAt: messageStats.lastMessageSentAt?.toISOString() || null,
          lastMessageFailedAt: messageStats.lastMessageFailedAt?.toISOString() || null
        }
      }
    })

    // Get subscription status
    const subscriptionStatus = subscription && subscription.expiredAt > new Date() ? 'active' : 'inactive'

    const response = {
      success: true,
      data: {
        sessions: {
          active: activeSessions,
          total: sessions.length,
          max: maxSessions,
          details: sessionDetails
        },
        messages: {
          total: totalMessageStats
        },
        campaigns: {
          scheduled: scheduledCampaigns,
          successful: successfulCampaigns,
          total: campaigns.length + bulkCampaigns.length,
          failed: failedCampaigns,
          list: campaigns.slice(0, 5).map(campaign => ({
            id: campaign.id.toString(),
            name: campaign.name,
            type: campaign.type,
            status: campaign.status || 'active',
            created_at: campaign.created_at?.toISOString() || new Date().toISOString()
          })),
          bulkCampaigns: bulkCampaigns.slice(0, 5).map(campaign => ({
            id: campaign.id.toString(),
            name: campaign.name,
            type: campaign.type,
            status: campaign.status || 'pending',
            total_count: campaign.total_count?.toString() || '0',
            sent_count: campaign.sent_count?.toString() || '0',
            failed_count: campaign.failed_count?.toString() || '0',
            scheduled_at: campaign.scheduled_at?.toISOString(),
            processed_at: campaign.processed_at?.toISOString(),
            completed_at: campaign.completed_at?.toISOString(),
            contacts_reached: Number(campaign.sent_count || 0),
            created_at: campaign.created_at?.toISOString() || new Date().toISOString()
          })),
          weeklyData,
          upcoming: upcomingCampaigns.map(campaign => ({
            id: campaign.id.toString(),
            name: campaign.name,
            scheduled_at: campaign.scheduled_at?.toISOString(),
            total_count: Number(campaign.total_count || 0)
          })),
          upcomingContacts
        },
        subscription: subscription ? {
          status: subscriptionStatus,
          packageName: subscription.package.name,
          maxSessions: subscription.package.maxSession,
          expiredAt: subscription.expiredAt.toISOString(),
          activatedAt: subscription.activatedAt.toISOString(),
          priceMonth: subscription.package.priceMonth,
          priceYear: subscription.package.priceYear
        } : null,
        transactions: whatsappTransactions.map(wt => {
          // Get original WhatsApp service price based on duration
          const originalWhatsappPrice = wt.duration === 'year' 
            ? wt.whatsappPackage.priceYear 
            : wt.whatsappPackage.priceMonth;

          // Calculate final WhatsApp service price considering voucher discount
          let finalWhatsappPrice = originalWhatsappPrice;
          let discountAmount = 0;
          let voucherInfo = null;

          if (wt.transaction.voucher && wt.transaction.discountAmount) {
            // If voucher was used, calculate the actual WhatsApp service price after discount
            const totalDiscount = Number(wt.transaction.discountAmount);
            const originalTotal = Number(wt.transaction.originalAmount || wt.transaction.amount);
            
            // Calculate discount percentage applied to the transaction
            const discountPercentage = totalDiscount / originalTotal;
            
            // Apply the same discount percentage to WhatsApp service price
            discountAmount = Math.floor(originalWhatsappPrice * discountPercentage);
            finalWhatsappPrice = originalWhatsappPrice - discountAmount;

            voucherInfo = {
              code: wt.transaction.voucher.code,
              name: wt.transaction.voucher.name,
              discountType: wt.transaction.voucher.discountType,
              value: Number(wt.transaction.voucher.value)
            };
          }
            
          return {
            id: wt.id,
            transactionId: wt.transactionId,
            packageName: wt.whatsappPackage.name,
            duration: wt.duration,
            status: wt.status,
            amount: finalWhatsappPrice, // WhatsApp service price after voucher discount
            originalPrice: originalWhatsappPrice, // Original WhatsApp service price
            discountAmount: discountAmount, // Discount applied to WhatsApp service
            voucherInfo: voucherInfo, // Voucher details if used
            totalTransactionAmount: Number(wt.transaction.amount), // Keep total amount for reference
            paymentId: wt.transaction.payment?.id,
            paymentStatus: wt.transaction.payment?.status || 'pending',
            paymentMethod: wt.transaction.payment?.method || 'Unknown',
            paymentDate: wt.transaction.payment?.paymentDate?.toISOString(),
            transactionDate: wt.transaction.transactionDate.toISOString(),
            createdAt: wt.transaction.createdAt.toISOString()
          }
        })
      }
    }

    return withCORS(NextResponse.json(response))
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return withCORS(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }))
  }
}
