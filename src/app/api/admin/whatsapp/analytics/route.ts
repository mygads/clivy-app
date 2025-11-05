import { NextRequest, NextResponse } from 'next/server';
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { withRoleAuthentication } from "@/lib/request-auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/whatsapp/analytics - Get WhatsApp analytics for admin
export async function GET(req: NextRequest) {
  const authResult = await withRoleAuthentication(req, ['admin'], async () => {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const days = parseInt(url.searchParams.get('days') || '30');

    try {
      // Calculate totals
      const totalMessageStats = await prisma.whatsAppMessageStats.count();
      const totalSessions = await prisma.whatsAppSession.count();
      const totalUsers = await prisma.user.count();

      // Get total messages sent across all users
      const totalMessagesSent = await prisma.whatsAppMessageStats.aggregate({
        _sum: {
          totalMessagesSent: true
        }
      });

      // Get total messages failed across all users
      const totalMessagesFailed = await prisma.whatsAppMessageStats.aggregate({
        _sum: {
          totalMessagesFailed: true
        }
      });

      // Get message breakdown by type (only sent messages have breakdown, failed is total)
      const messageTypeBreakdown = await prisma.whatsAppMessageStats.aggregate({
        _sum: {
          textMessagesSent: true,
          imageMessagesSent: true,
          documentMessagesSent: true,
          audioMessagesSent: true,
          videoMessagesSent: true,
          stickerMessagesSent: true,
          locationMessagesSent: true,
          contactMessagesSent: true,
          templateMessagesSent: true,
          totalMessagesFailed: true, // Only one failed field for all types
        }
      });

      // Calculate message type statistics (failed is distributed proportionally)
      const totalSentAllTypes = 
        (messageTypeBreakdown._sum.textMessagesSent || 0) +
        (messageTypeBreakdown._sum.imageMessagesSent || 0) +
        (messageTypeBreakdown._sum.documentMessagesSent || 0) +
        (messageTypeBreakdown._sum.audioMessagesSent || 0) +
        (messageTypeBreakdown._sum.videoMessagesSent || 0) +
        (messageTypeBreakdown._sum.stickerMessagesSent || 0) +
        (messageTypeBreakdown._sum.locationMessagesSent || 0) +
        (messageTypeBreakdown._sum.contactMessagesSent || 0) +
        (messageTypeBreakdown._sum.templateMessagesSent || 0);

      const totalFailedAllTypes = messageTypeBreakdown._sum.totalMessagesFailed || 0;

      const messageTypes = {
        text: {
          sent: messageTypeBreakdown._sum.textMessagesSent || 0,
          failed: totalSentAllTypes > 0 ? Math.round((messageTypeBreakdown._sum.textMessagesSent || 0) / totalSentAllTypes * totalFailedAllTypes) : 0,
        },
        image: {
          sent: messageTypeBreakdown._sum.imageMessagesSent || 0,
          failed: totalSentAllTypes > 0 ? Math.round((messageTypeBreakdown._sum.imageMessagesSent || 0) / totalSentAllTypes * totalFailedAllTypes) : 0,
        },
        document: {
          sent: messageTypeBreakdown._sum.documentMessagesSent || 0,
          failed: totalSentAllTypes > 0 ? Math.round((messageTypeBreakdown._sum.documentMessagesSent || 0) / totalSentAllTypes * totalFailedAllTypes) : 0,
        },
        audio: {
          sent: messageTypeBreakdown._sum.audioMessagesSent || 0,
          failed: totalSentAllTypes > 0 ? Math.round((messageTypeBreakdown._sum.audioMessagesSent || 0) / totalSentAllTypes * totalFailedAllTypes) : 0,
        },
        video: {
          sent: messageTypeBreakdown._sum.videoMessagesSent || 0,
          failed: totalSentAllTypes > 0 ? Math.round((messageTypeBreakdown._sum.videoMessagesSent || 0) / totalSentAllTypes * totalFailedAllTypes) : 0,
        },
        sticker: {
          sent: messageTypeBreakdown._sum.stickerMessagesSent || 0,
          failed: totalSentAllTypes > 0 ? Math.round((messageTypeBreakdown._sum.stickerMessagesSent || 0) / totalSentAllTypes * totalFailedAllTypes) : 0,
        },
        location: {
          sent: messageTypeBreakdown._sum.locationMessagesSent || 0,
          failed: totalSentAllTypes > 0 ? Math.round((messageTypeBreakdown._sum.locationMessagesSent || 0) / totalSentAllTypes * totalFailedAllTypes) : 0,
        },
        contact: {
          sent: messageTypeBreakdown._sum.contactMessagesSent || 0,
          failed: totalSentAllTypes > 0 ? Math.round((messageTypeBreakdown._sum.contactMessagesSent || 0) / totalSentAllTypes * totalFailedAllTypes) : 0,
        },
        template: {
          sent: messageTypeBreakdown._sum.templateMessagesSent || 0,
          failed: totalSentAllTypes > 0 ? Math.round((messageTypeBreakdown._sum.templateMessagesSent || 0) / totalSentAllTypes * totalFailedAllTypes) : 0,
        },
      };

      // Format message type data for charts
      const messageTypeChartData = Object.entries(messageTypes).map(([type, data]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        sent: data.sent,
        failed: data.failed,
        total: data.sent + data.failed,
        successRate: data.sent + data.failed > 0 ? ((data.sent / (data.sent + data.failed)) * 100).toFixed(2) : '0',
      })).filter(item => item.total > 0).sort((a, b) => b.total - a.total);

      // Get top users by message count (only sent messages have breakdown, failed is total)
      const topUsersStats = await prisma.whatsAppMessageStats.groupBy({
        by: ['userId'],
        _sum: {
          totalMessagesSent: true,
          totalMessagesFailed: true,
          textMessagesSent: true,
          imageMessagesSent: true,
          documentMessagesSent: true,
          audioMessagesSent: true,
          videoMessagesSent: true,
          stickerMessagesSent: true,
          locationMessagesSent: true,
          contactMessagesSent: true,
          templateMessagesSent: true,
        },
        orderBy: {
          _sum: {
            totalMessagesSent: 'desc'
          }
        },
        take: 15
      });

      // Get user details for top users with additional info including session details
      const userIds = topUsersStats.map(u => u.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          phone: true,
          createdAt: true,
          whatsappCustomers: {
            select: {
              status: true,
              expiredAt: true,
              activatedAt: true,
              package: {
                select: {
                  name: true,
                  maxSession: true,
                }
              }
            }
          },
          whatsAppSessions: {
            select: {
              id: true,
              sessionId: true,
              sessionName: true,
              status: true,
              connected: true,
              createdAt: true,
              whatsAppMessageStats: {
                select: {
                  totalMessagesSent: true,
                  totalMessagesFailed: true,
                  lastMessageSentAt: true,
                }
              }
            }
          }
        }
      });

      const topUsersWithDetails = topUsersStats.map(stat => {
        const userDetail = users.find(u => u.id === stat.userId);
        
        // Calculate user-specific metrics
        const totalSent = stat._sum.totalMessagesSent || 0;
        const totalFailed = stat._sum.totalMessagesFailed || 0;
        const totalMessages = totalSent + totalFailed;
        const successRate = totalMessages > 0 ? ((totalSent / totalMessages) * 100).toFixed(2) : '0';
        
        // Calculate total sent messages by type for this user
        const userTotalSentByType = 
          (stat._sum.textMessagesSent || 0) +
          (stat._sum.imageMessagesSent || 0) +
          (stat._sum.documentMessagesSent || 0) +
          (stat._sum.audioMessagesSent || 0) +
          (stat._sum.videoMessagesSent || 0) +
          (stat._sum.stickerMessagesSent || 0) +
          (stat._sum.locationMessagesSent || 0) +
          (stat._sum.contactMessagesSent || 0) +
          (stat._sum.templateMessagesSent || 0);

        // Message type breakdown for this user (failed distributed proportionally)
        const messageTypeBreakdown = {
          text: { 
            sent: stat._sum.textMessagesSent || 0, 
            failed: userTotalSentByType > 0 ? Math.round((stat._sum.textMessagesSent || 0) / userTotalSentByType * totalFailed) : 0 
          },
          image: { 
            sent: stat._sum.imageMessagesSent || 0, 
            failed: userTotalSentByType > 0 ? Math.round((stat._sum.imageMessagesSent || 0) / userTotalSentByType * totalFailed) : 0 
          },
          document: { 
            sent: stat._sum.documentMessagesSent || 0, 
            failed: userTotalSentByType > 0 ? Math.round((stat._sum.documentMessagesSent || 0) / userTotalSentByType * totalFailed) : 0 
          },
          audio: { 
            sent: stat._sum.audioMessagesSent || 0, 
            failed: userTotalSentByType > 0 ? Math.round((stat._sum.audioMessagesSent || 0) / userTotalSentByType * totalFailed) : 0 
          },
          video: { 
            sent: stat._sum.videoMessagesSent || 0, 
            failed: userTotalSentByType > 0 ? Math.round((stat._sum.videoMessagesSent || 0) / userTotalSentByType * totalFailed) : 0 
          },
          sticker: { 
            sent: stat._sum.stickerMessagesSent || 0, 
            failed: userTotalSentByType > 0 ? Math.round((stat._sum.stickerMessagesSent || 0) / userTotalSentByType * totalFailed) : 0 
          },
          location: { 
            sent: stat._sum.locationMessagesSent || 0, 
            failed: userTotalSentByType > 0 ? Math.round((stat._sum.locationMessagesSent || 0) / userTotalSentByType * totalFailed) : 0 
          },
          contact: { 
            sent: stat._sum.contactMessagesSent || 0, 
            failed: userTotalSentByType > 0 ? Math.round((stat._sum.contactMessagesSent || 0) / userTotalSentByType * totalFailed) : 0 
          },
          template: { 
            sent: stat._sum.templateMessagesSent || 0, 
            failed: userTotalSentByType > 0 ? Math.round((stat._sum.templateMessagesSent || 0) / userTotalSentByType * totalFailed) : 0 
          },
        };

        // Most used message type
        const mostUsedType = Object.entries(messageTypeBreakdown)
          .map(([type, data]) => ({ type, total: data.sent + data.failed }))
          .sort((a, b) => b.total - a.total)[0];

        // Active sessions count with message details
        const activeSessions = userDetail?.whatsAppSessions?.filter(s => s.status === 'connected' || s.connected).length || 0;
        const totalSessions = userDetail?.whatsAppSessions?.length || 0;

        // Session details with message counts
        const sessionDetails = userDetail?.whatsAppSessions?.map(session => ({
          sessionId: session.sessionId,
          sessionName: session.sessionName,
          status: session.status,
          connected: session.connected,
          createdAt: session.createdAt,
          messagesSent: session.whatsAppMessageStats?.[0]?.totalMessagesSent || 0,
          messagesFailed: session.whatsAppMessageStats?.[0]?.totalMessagesFailed || 0,
          lastMessageAt: session.whatsAppMessageStats?.[0]?.lastMessageSentAt || null,
        })) || [];

        // Subscription info
        const activeSubscription = userDetail?.whatsappCustomers?.find(c => c.status === 'active');
        const daysSinceJoined = userDetail?.createdAt 
          ? Math.floor((new Date().getTime() - new Date(userDetail.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          userId: stat.userId,
          totalSent,
          totalFailed,
          totalMessages,
          successRate,
          messageTypeBreakdown,
          mostUsedMessageType: mostUsedType?.type || 'none',
          activeSessions,
          totalSessions,
          sessionDetails,
          daysSinceJoined,
          user: userDetail,
          subscription: activeSubscription ? {
            packageName: activeSubscription.package.name,
            maxSession: activeSubscription.package.maxSession,
            status: activeSubscription.status,
            expiresAt: activeSubscription.expiredAt,
            activatedAt: activeSubscription.activatedAt,
          } : null,
        };
      });

      // Get session statistics
      const sessionStats = await prisma.whatsAppSession.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      });

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentActivity = await prisma.whatsAppMessageStats.findMany({
        where: {
          lastMessageSentAt: {
            gte: thirtyDaysAgo
          }
        },
        select: {
          userId: true,
          totalMessagesSent: true,
          totalMessagesFailed: true,
          lastMessageSentAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          lastMessageSentAt: 'desc'
        },
        take: 20
      });

      const result = {
        totalUsers,
        totalSessions,
        totalMessageStats,
        totalMessagesSent: totalMessagesSent._sum.totalMessagesSent || 0,
        totalMessagesFailed: totalMessagesFailed._sum.totalMessagesFailed || 0,
        messageTypes,
        messageTypeChartData,
        sessionStats: sessionStats.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        topUsers: topUsersWithDetails,
        recentActivity
      };

      return withCORS(NextResponse.json({
        success: true,
        data: result
      }));

    } catch (error) {
      console.error('Error fetching WhatsApp analytics:', error);
      return withCORS(NextResponse.json({
        success: false,
        error: 'Failed to fetch analytics'
      }, { status: 500 }));
    }
  });

  // Handle authentication/authorization errors
  if (authResult && typeof authResult === 'object' && 'success' in authResult && !authResult.success) {
    return withCORS(NextResponse.json({
      success: false,
      error: authResult.error
    }, { status: authResult.status || 401 }))
  }

  // Return the actual response from the handler
  return authResult as NextResponse
}

export async function OPTIONS(req: NextRequest) {
  return corsOptionsResponse();
}
