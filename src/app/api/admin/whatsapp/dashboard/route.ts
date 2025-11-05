import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS } from "@/lib/cors";
import { withRoleAuthentication } from "@/lib/request-auth";

export async function GET(request: NextRequest) {
  const result = await withRoleAuthentication(request, ['admin'], async (user) => {
    try {
      const url = new URL(request.url);
      const period = url.searchParams.get('period') || 'daily';
      const monthParam = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);
      
      // Parse month parameter
      const selectedMonth = new Date(monthParam + '-01');
      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
      
      // Current date calculations
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      
      // Calculate period for charts (last 30 days)
      const chartStartDate = new Date();
      chartStartDate.setDate(chartStartDate.getDate() - 30);

      // Get all WhatsApp message statistics
      const messageStats = await prisma.whatsAppMessageStats.aggregate({
        _sum: {
          totalMessagesSent: true,
          totalMessagesFailed: true,
        },
      });

      const totalSent = messageStats._sum.totalMessagesSent || 0;
      const totalFailed = messageStats._sum.totalMessagesFailed || 0;
      const totalMessages = totalSent + totalFailed;
      const successRate = totalMessages > 0 ? (totalSent / totalMessages) * 100 : 0;

      // Today's statistics
      const todayStats = await prisma.whatsAppMessageStats.aggregate({
        where: {
          createdAt: {
            gte: startOfToday,
            lt: endOfToday,
          },
        },
        _sum: {
          totalMessagesSent: true,
          totalMessagesFailed: true,
        },
      });

      const todaySent = todayStats._sum.totalMessagesSent || 0;
      const todayFailed = todayStats._sum.totalMessagesFailed || 0;
      const todayTotal = todaySent + todayFailed;
      const todaySuccessRate = todayTotal > 0 ? (todaySent / todayTotal) * 100 : 0;

      // Monthly statistics
      const monthlyStats = await prisma.whatsAppMessageStats.aggregate({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          totalMessagesSent: true,
          totalMessagesFailed: true,
        },
      });

      const monthlySent = monthlyStats._sum.totalMessagesSent || 0;
      const monthlyFailed = monthlyStats._sum.totalMessagesFailed || 0;
      const monthlyTotal = monthlySent + monthlyFailed;
      const monthlySuccessRate = monthlyTotal > 0 ? (monthlySent / monthlyTotal) * 100 : 0;

      // Get subscription counts
      const totalSubscribers = await prisma.servicesWhatsappCustomers.count();
      const totalActiveSubscriptions = await prisma.servicesWhatsappCustomers.count({
        where: {
          status: 'active',
        },
      });

      // Get session count
      const totalSessions = await prisma.whatsAppSession.count();

      // Get total WhatsApp users
      const totalWhatsAppUsers = await prisma.user.count({
        where: {
          whatsappCustomers: {
            some: {
              status: 'active',
            },
          },
        },
      });

      // Calculate revenue from WhatsApp packages based on transaction currency
      const whatsappTransactions = await prisma.transactionWhatsappService.findMany({
        where: {
          transaction: {
            status: {
              in: ['in_progress', 'success']
            }
          }
        },
        include: {
          transaction: {
            include: {
              voucher: {
                select: {
                  id: true,
                  code: true,
                  discountType: true,
                  value: true
                }
              },
              productTransactions: true,
              addonTransactions: true
            }
          },
          whatsappPackage: true,
        },
      });

      // Calculate total revenue by currency (based on what user actually paid with voucher discount)
      let totalRevenueIdr = 0;
      let totalRevenueUsd = 0;
      let monthlyRevenueIdr = 0;
      let monthlyRevenueUsd = 0;

      whatsappTransactions.forEach(wt => {
        const currency = wt.transaction.currency || 'idr';
        
        // Get base package price
        let packagePrice = 0;
        if (wt.duration === 'year') {
          packagePrice = currency === 'idr' ? Number(wt.whatsappPackage.priceYear_idr || 0) : Number(wt.whatsappPackage.priceYear_usd || 0);
        } else {
          packagePrice = currency === 'idr' ? Number(wt.whatsappPackage.priceMonth_idr || 0) : Number(wt.whatsappPackage.priceMonth_usd || 0);
        }

        // Apply voucher discount if exists
        let finalWhatsAppPrice = packagePrice;
        if (wt.transaction.voucher && wt.transaction.discountAmount) {
          const discountAmount = Number(wt.transaction.discountAmount);
          
          if (wt.transaction.voucher.discountType === 'percentage') {
            // Percentage discount - apply directly to WhatsApp package
            const voucherValue = Number(wt.transaction.voucher.value || 0);
            finalWhatsAppPrice = packagePrice * (1 - (voucherValue / 100));
          } else {
            // Fixed amount discount - calculate proportional discount based on total transaction amount
            // Get total amount from transaction (before discount, excluding service fees)
            const totalTransactionAmount = Number(wt.transaction.amount || 0);
            
            if (totalTransactionAmount > 0 && packagePrice > 0) {
              // Calculate WhatsApp proportion of total transaction
              const whatsappProportion = packagePrice / totalTransactionAmount;
              
              // Apply proportional discount to WhatsApp service
              const whatsappDiscountShare = discountAmount * whatsappProportion;
              finalWhatsAppPrice = Math.max(0, packagePrice - whatsappDiscountShare);
            } else {
              // If we can't calculate proportion, apply full discount (single service case)
              finalWhatsAppPrice = Math.max(0, packagePrice - discountAmount);
            }
          }
        }

        // Add revenue based on transaction currency (what user actually paid)
        if (currency === 'idr') {
          totalRevenueIdr += finalWhatsAppPrice;
          
          // Add to monthly revenue if transaction is within current month
          if (wt.transaction.createdAt >= startOfMonth && wt.transaction.createdAt <= endOfMonth) {
            monthlyRevenueIdr += finalWhatsAppPrice;
          }
        } else if (currency === 'usd') {
          totalRevenueUsd += finalWhatsAppPrice;
          
          // Add to monthly revenue if transaction is within current month
          if (wt.transaction.createdAt >= startOfMonth && wt.transaction.createdAt <= endOfMonth) {
            monthlyRevenueUsd += finalWhatsAppPrice;
          }
        }
      });

      // Get new subscriptions today
      const newSubscriptionsToday = await prisma.servicesWhatsappCustomers.count({
        where: {
          activatedAt: {
            gte: startOfToday,
            lt: endOfToday,
          },
        },
      });

      // Get new subscriptions this month
      const newSubscriptionsMonth = await prisma.servicesWhatsappCustomers.count({
        where: {
          activatedAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      // Generate chart data for last 30 days
      const messageChartData = [];
      const revenueChartData = [];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        // Message data for this day
        const dayMessageStats = await prisma.whatsAppMessageStats.aggregate({
          where: {
            createdAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
          _sum: {
            totalMessagesSent: true,
            totalMessagesFailed: true,
          },
        });

        const daySent = dayMessageStats._sum.totalMessagesSent || 0;
        const dayFailed = dayMessageStats._sum.totalMessagesFailed || 0;
        const dayTotal = daySent + dayFailed;

        messageChartData.push({
          date: date.toISOString().split('T')[0],
          sent: daySent,
          failed: dayFailed,
          total: dayTotal,
        });

        // Revenue data for this day - calculate from package prices based on transaction currency with voucher discount
        const dayWhatsappTransactions = await prisma.transactionWhatsappService.findMany({
          where: {
            transaction: {
              status: {
                in: ['in_progress', 'success']
              },
              createdAt: {
                gte: startOfDay,
                lt: endOfDay,
              },
            }
          },
          include: {
            transaction: {
              include: {
                voucher: {
                  select: {
                    id: true,
                    code: true,
                    discountType: true,
                    value: true
                  }
                },
                productTransactions: true,
                addonTransactions: true
              }
            },
            whatsappPackage: true,
          },
        });

        let dayRevenueIdr = 0;
        let dayRevenueUsd = 0;

        dayWhatsappTransactions.forEach(wt => {
          const currency = wt.transaction.currency || 'idr';
          
          // Get base package price
          let packagePrice = 0;
          if (wt.duration === 'year') {
            packagePrice = currency === 'idr' ? Number(wt.whatsappPackage.priceYear_idr || 0) : Number(wt.whatsappPackage.priceYear_usd || 0);
          } else {
            packagePrice = currency === 'idr' ? Number(wt.whatsappPackage.priceMonth_idr || 0) : Number(wt.whatsappPackage.priceMonth_usd || 0);
          }

          // Apply voucher discount if exists
          let finalWhatsAppPrice = packagePrice;
          if (wt.transaction.voucher && wt.transaction.discountAmount) {
            const discountAmount = Number(wt.transaction.discountAmount);
            
            if (wt.transaction.voucher.discountType === 'percentage') {
              // Percentage discount - apply directly to WhatsApp package
              const voucherValue = Number(wt.transaction.voucher.value || 0);
              finalWhatsAppPrice = packagePrice * (1 - (voucherValue / 100));
            } else {
              // Fixed amount discount - calculate proportional discount based on total transaction amount
              // Get total amount from transaction (before discount, excluding service fees)
              const totalTransactionAmount = Number(wt.transaction.amount || 0);
              
              if (totalTransactionAmount > 0 && packagePrice > 0) {
                // Calculate WhatsApp proportion of total transaction
                const whatsappProportion = packagePrice / totalTransactionAmount;
                
                // Apply proportional discount to WhatsApp service
                const whatsappDiscountShare = discountAmount * whatsappProportion;
                finalWhatsAppPrice = Math.max(0, packagePrice - whatsappDiscountShare);
              } else {
                // If we can't calculate proportion, apply full discount (single service case)
                finalWhatsAppPrice = Math.max(0, packagePrice - discountAmount);
              }
            }
          }

          // Add revenue based on transaction currency (what user actually paid)
          if (currency === 'idr') {
            dayRevenueIdr += finalWhatsAppPrice;
          } else if (currency === 'usd') {
            dayRevenueUsd += finalWhatsAppPrice;
          }
        });

        revenueChartData.push({
          date: date.toISOString().split('T')[0],
          idr: dayRevenueIdr,
          usd: dayRevenueUsd,
        });
      }

      // Get top users of the week (based on message sent in last 7 days)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const topUsersWeek = await prisma.user.findMany({
        where: {
          whatsappCustomers: {
            some: {
              status: 'active',
            },
          },
        },
        include: {
          whatsappCustomers: {
            where: {
              status: 'active',
            },
          },
          whatsAppSessions: true,
          whatsAppMessageStats: {
            where: {
              createdAt: {
                gte: weekStart,
              },
            },
          },
        },
        take: 50, // Get more users to sort them by actual message count
      });

      // Calculate actual message statistics for each user and sort by total messages
      const usersWithStats = await Promise.all(
        topUsersWeek.map(async (user) => {
          // Get total messages sent by this user in the last week
          const userMessageStats = await prisma.whatsAppMessageStats.aggregate({
            where: {
              userId: user.id,
              createdAt: {
                gte: weekStart,
              },
            },
            _sum: {
              totalMessagesSent: true,
              totalMessagesFailed: true,
            },
          });

          const totalSent = userMessageStats._sum.totalMessagesSent || 0;
          const totalFailed = userMessageStats._sum.totalMessagesFailed || 0;
          const totalMessages = totalSent + totalFailed;
          const successRate = totalMessages > 0 ? (totalSent / totalMessages) * 100 : 0;

          return {
            id: user.id,
            name: user.name || 'Unknown User',
            email: user.email || 'No email',
            totalMessagesSent: totalSent,
            totalMessagesFailed: totalFailed,
            totalMessages: totalMessages,
            successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
            activeSessions: user.whatsAppSessions.length,
          };
        })
      );

      // Sort by total messages sent and take top 5
      const formattedTopUsers = usersWithStats
        .sort((a, b) => b.totalMessagesSent - a.totalMessagesSent)
        .slice(0, 5);

      // Get recent subscriptions (last 5)
      const recentSubscriptions = await prisma.servicesWhatsappCustomers.findMany({
        orderBy: {
          activatedAt: 'desc',
        },
        take: 5,
        include: {
          customer: true,
          package: true,
        },
      });

      const formattedRecentSubscriptions = recentSubscriptions.map((sub) => ({
        id: sub.id,
        userName: sub.customer.name || 'Unknown User',
        userEmail: sub.customer.email || 'No email',
        packageName: sub.package.name,
        activatedAt: sub.activatedAt.toISOString(),
        expiredAt: sub.expiredAt?.toISOString() || '',
        status: sub.status,
      }));

      // Get top packages
      const topPackages = await prisma.whatsappApiPackage.findMany({
        include: {
          _count: {
            select: {
              whatsappCustomers: true,
            },
          },
        },
        orderBy: {
          whatsappCustomers: {
            _count: 'desc',
          },
        },
        take: 6,
      });

      const formattedTopPackages = topPackages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        priceMonth_idr: pkg.priceMonth_idr,
        priceMonth_usd: pkg.priceMonth_usd,
        priceYear_idr: pkg.priceYear_idr,
        priceYear_usd: pkg.priceYear_usd,
        maxSession: pkg.maxSession,
        purchaseCount: pkg._count.whatsappCustomers,
      }));

      const dashboardData = {
        // Overall Statistics
        totalSubscribers,
        totalActiveSubscriptions,
        totalSessions,
        totalWhatsAppUsers,
        totalRevenue: {
          idr: totalRevenueIdr,
          usd: totalRevenueUsd,
        },

        // Message Statistics
        messageStats: {
          totalSent,
          totalFailed,
          successRate,
        },

        // Daily Statistics
        dailyStats: {
          messageSent: todaySent,
          messageFailed: todayFailed,
          successRate: todaySuccessRate,
          newSubscriptions: newSubscriptionsToday,
        },

        // Monthly Statistics
        monthlyStats: {
          messageSent: monthlySent,
          messageFailed: monthlyFailed,
          successRate: monthlySuccessRate,
          newSubscriptions: newSubscriptionsMonth,
          revenue: {
            idr: monthlyRevenueIdr,
            usd: monthlyRevenueUsd,
          },
        },

        // Charts Data
        messageChart: messageChartData,
        revenueChart: revenueChartData,

        // Top Users of the Week
        topUsersWeek: formattedTopUsers,

        // Recent Subscriptions
        recentSubscriptions: formattedRecentSubscriptions,

        // Top Packages
        topPackages: formattedTopPackages,
      };

      return withCORS(
        NextResponse.json({
          success: true,
          data: dashboardData,
        })
      );
    } catch (error) {
      console.error("Error fetching WhatsApp dashboard data:", error);
      return withCORS(
        NextResponse.json(
          {
            success: false,
            error: "Failed to fetch dashboard data",
          },
          { status: 500 }
        )
      );
    }
  });

  // Ensure GET always returns a Response (wrap auth failure objects)
  if (result && typeof result === 'object' && 'success' in result && (result as any).success === false) {
    const err = result as { success: false; error: string; status: number };
    return withCORS(NextResponse.json(err, { status: err.status || 401 }));
  }
  return result as Response;
}
