import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getAdminAuth } from "@/lib/auth-helpers";

// Helper function to get date range filters with comparison periods
function getDateRangeFilter(period: string) {
  const now = new Date();
  
  // Convert to WIB (UTC+7)
  const wibOffset = 7 * 60; // 7 hours in minutes
  const wibNow = new Date(now.getTime() + (wibOffset * 60 * 1000));
  
  let startDate = new Date();
  let endDate = new Date();
  let comparisonStartDate: Date | null = null;
  let comparisonEndDate: Date | null = null;

  switch (period) {
    case 'today':
      // Today in WIB
      startDate = new Date(wibNow);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(wibNow);
      endDate.setHours(23, 59, 59, 999);
      
      // Yesterday for comparison
      comparisonStartDate = new Date(startDate);
      comparisonStartDate.setDate(startDate.getDate() - 1);
      comparisonEndDate = new Date(endDate);
      comparisonEndDate.setDate(endDate.getDate() - 1);
      break;
      
    case 'week':
      // This week (Monday to Sunday)
      const dayOfWeek = wibNow.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      startDate = new Date(wibNow);
      startDate.setDate(wibNow.getDate() - daysToMonday);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      
      // Last week for comparison
      comparisonStartDate = new Date(startDate);
      comparisonStartDate.setDate(startDate.getDate() - 7);
      comparisonEndDate = new Date(endDate);
      comparisonEndDate.setDate(endDate.getDate() - 7);
      break;
      
    case 'month':
      // This month
      startDate = new Date(wibNow.getFullYear(), wibNow.getMonth(), 1);
      endDate = new Date(wibNow.getFullYear(), wibNow.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      
      // Last month for comparison
      comparisonStartDate = new Date(wibNow.getFullYear(), wibNow.getMonth() - 1, 1);
      comparisonEndDate = new Date(wibNow.getFullYear(), wibNow.getMonth(), 0);
      comparisonEndDate.setHours(23, 59, 59, 999);
      break;
      
    case 'all_time':
    default:
      startDate = new Date('2020-01-01');
      endDate = new Date(wibNow);
      endDate.setHours(23, 59, 59, 999);
      
      // No comparison for all time
      comparisonStartDate = null;
      comparisonEndDate = null;
      break;
  }

  // Convert back to UTC for database queries
  const utcOffset = wibOffset * 60 * 1000;
  
  return {
    current: {
      gte: new Date(startDate.getTime() - utcOffset),
      lt: new Date(endDate.getTime() - utcOffset)
    },
    comparison: comparisonStartDate && comparisonEndDate ? {
      gte: new Date(comparisonStartDate.getTime() - utcOffset),
      lt: new Date(comparisonEndDate.getTime() - utcOffset)
    } : null
  };
}

// Helper function to format currency
function formatCurrency(amount: number | null | undefined, currency: string): string {
  // Handle null, undefined, or NaN values
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Rp 0';
  }
  
  const numericAmount = Number(amount);
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

// Helper function to convert UTC to WIB for peak hour
function getWIBHour(utcHour: number): number {
  return (utcHour + 7) % 24;
}

// GET /api/admin/dashboard/analytics - Get comprehensive dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      ));
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today'; // today, week, month, all_time
    const currency = searchParams.get('currency') || 'idr'; // IDR only
    
    // console.log(`Analytics request - Period: ${period}, Currency: ${currency}`);
    
    const dateFilter = getDateRangeFilter(period);
    const currentPeriodFilter = dateFilter.current;
    const comparisonPeriodFilter = dateFilter.comparison;

    // 1. Current Period Analytics
    const [
      // Basic transaction counts
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      
      // Revenue data with paid transactions only
      revenueData,
      
      // User analytics
      newUsersCount,
      totalActiveUsersCount,
      
      // Top performing WhatsApp services
      topWhatsappData,
      
      // Distribution analytics
      hourlyDistribution,
      paymentMethodBreakdown,
      categoryStats,
      conversionFunnel,
      
      // Service fees and vouchers
      serviceFeeAnalytics,
      voucherStats,
      
      // Processing time and delivery analytics
      avgProcessingTimeData,
      
      // WhatsApp subscription analytics
      whatsappSubscriptionData,
      
      // Recent transactions
      recentTransactions
    ] = await Promise.all([
      // Total transactions in current period
      prisma.transaction.count({
        where: {
          createdAt: currentPeriodFilter,
          currency: currency
        }
      }),
      
      // Completed transactions (paid status)
      prisma.transaction.count({
        where: {
          payment: { status: 'paid' },
          createdAt: currentPeriodFilter,
          currency: currency
        }
      }),
      
      // Pending transactions
      prisma.transaction.count({
        where: {
          status: 'pending',
          createdAt: currentPeriodFilter,
          currency: currency
        }
      }),
      
      // Failed transactions
      prisma.transaction.count({
        where: {
          status: 'failed',
          createdAt: currentPeriodFilter,
          currency: currency
        }
      }),
      
      // Revenue data from paid transactions only
      prisma.transaction.aggregate({
        where: {
          payment: { status: 'paid' },
          createdAt: currentPeriodFilter,
          currency: currency
        },
        _sum: {
          finalAmount: true,
          originalAmount: true,
          discountAmount: true,
          serviceFeeAmount: true
        },
        _avg: {
          finalAmount: true
        },
        _count: {
          id: true
        }
      }),
      
      // New users in current period
      prisma.user.count({
        where: {
          createdAt: currentPeriodFilter,
          role: 'customer'
        }
      }),
      
      // Total active users (users with transactions in current period)
      prisma.user.count({
        where: {
          transactions: {
            some: {
              createdAt: currentPeriodFilter,
              currency: currency
            }
          }
        }
      }),
      
      // Top performing WhatsApp services - count-based analysis
      prisma.transactionWhatsappService.groupBy({
        by: ['whatsappPackageId'],
        where: {
          transaction: {
            payment: { status: 'paid' },
            createdAt: currentPeriodFilter,
            currency: currency
          }
        },
        _count: {
          whatsappPackageId: true
        },
        orderBy: {
          _count: {
            whatsappPackageId: 'desc'
          }
        },
        take: 20
      }),
      
      // Hourly transaction distribution - only paid transactions
      prisma.$queryRaw<{hour: number, count: number}[]>`
        SELECT 
          EXTRACT(HOUR FROM t."createdAt") as hour,
          COUNT(*) as count
        FROM "Transaction" t
        JOIN "Payment" p ON t.id = p."transactionId"
        WHERE p.status = 'paid'
          AND t."createdAt" >= ${currentPeriodFilter.gte}
          AND t."createdAt" < ${currentPeriodFilter.lt}
          AND t.currency = ${currency}
        GROUP BY EXTRACT(HOUR FROM t."createdAt")
        ORDER BY hour
      `,
      
      // Payment method breakdown - Use raw SQL to avoid ambiguous column reference
      prisma.$queryRaw<Array<{method: string, count: bigint, total_amount: any}>>`
        SELECT 
          p."method",
          COUNT(p."method")::bigint as count,
          SUM(p."amount") as total_amount
        FROM "Payment" p
        INNER JOIN "Transaction" t ON p."transactionId" = t."id"
        WHERE p."status" = 'paid'
          AND t."createdAt" >= ${currentPeriodFilter.gte}
          AND t."createdAt" < ${currentPeriodFilter.lt}
          AND t."currency" = ${currency}
        GROUP BY p."method"
      `,
      
      // Category performance stats
      prisma.transaction.groupBy({
        by: ['type'],
        where: {
          payment: { status: 'paid' },
          createdAt: currentPeriodFilter,
          currency: currency
        },
        _count: { type: true },
        _sum: { finalAmount: true }
      }),
      
      // Conversion funnel
      prisma.transaction.groupBy({
        by: ['status'],
        where: {
          createdAt: currentPeriodFilter,
          currency: currency
        },
        _count: {
          status: true
        }
      }),
      
      // Service fee analytics
      prisma.payment.aggregate({
        where: {
          status: 'paid',
          transaction: {
            createdAt: currentPeriodFilter,
            currency: currency
          }
        },
        _sum: {
          serviceFee: true
        }
      }),
      
      // Voucher stats
      prisma.transaction.aggregate({
        where: {
          payment: { status: 'paid' },
          createdAt: currentPeriodFilter,
          currency: currency,
          discountAmount: {
            gt: 0
          }
        },
        _count: {
          _all: true
        },
        _sum: {
          discountAmount: true
        }
      }),
      
      // Average processing time for completed transactions
      prisma.$queryRaw<{avg_processing_time: number}[]>`
        SELECT AVG(
          EXTRACT(EPOCH FROM (p."updatedAt" - t."createdAt")) / 60
        )::float as avg_processing_time
        FROM "Transaction" t
        JOIN "Payment" p ON t.id = p."transactionId"
        WHERE p.status = 'paid'
          AND t."createdAt" >= ${currentPeriodFilter.gte}
          AND t."createdAt" < ${currentPeriodFilter.lt}
          AND t.currency = ${currency}
      `,
      
      // WhatsApp subscription analytics for current period - get all transactions with paid status
      prisma.transactionWhatsappService.findMany({
        where: {
          transaction: {
            currency: currency,
            createdAt: currentPeriodFilter,
            OR: [
              { status: 'success' },
              { status: 'paid' }
            ]
          }
        },
        include: {
          transaction: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              currency: true,
              userId: true,
            }
          },
          whatsappPackage: {
            select: {
              name: true,
              maxSession: true,
              priceMonth: true,
              priceYear: true,
            }
          }
        }
      }),
      
      // Recent transactions (Show ALL with both statuses)
      prisma.transaction.findMany({
        where: {
          currency: currency,
          createdAt: currentPeriodFilter
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          payment: {
            select: {
              method: true,
              status: true
            }
          },
          whatsappTransaction: {
            include: {
              whatsappPackage: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      })
    ]);

    // 2. Comparison Period Analytics (if available)
    let comparisonData = null;
    if (comparisonPeriodFilter) {
      const [
        comparisonRevenue,
        comparisonTransactions,
        comparisonNewUsers
      ] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            payment: { status: 'paid' },
            createdAt: comparisonPeriodFilter,
            currency: currency
          },
          _sum: {
            finalAmount: true
          },
          _count: {
            id: true
          }
        }),
        
        prisma.transaction.count({
          where: {
            payment: { status: 'paid' },
            createdAt: comparisonPeriodFilter,
            currency: currency
          }
        }),
        
        prisma.user.count({
          where: {
            createdAt: comparisonPeriodFilter,
            role: 'customer'
          }
        })
      ]);
      
      comparisonData = {
        revenue: Number(comparisonRevenue._sum.finalAmount || 0),
        transactions: Number(comparisonRevenue._count.id || 0),
        newUsers: comparisonNewUsers
      };
    }

    // 3. Dynamic Revenue Trend (for charts) - based on period with proper data structure
    let revenueTrend: Array<{ date: string; period: string; transactions: number; revenue: number }> = [];
    
    if (period === 'today') {
      // For today: Hourly trends (24 columns) - current hour as last column
      const hourlyData = await prisma.$queryRaw<Array<{ hour: number; transactions: number; revenue: number }>>`
        SELECT 
          EXTRACT(HOUR FROM t."createdAt")::int as hour,
          COUNT(*)::int as transactions,
          SUM(CAST(t."finalAmount" AS DECIMAL(10,2)))::float as revenue
        FROM "Transaction" t
        JOIN "Payment" p ON t.id = p."transactionId"
        WHERE 
          p.status = 'paid'
          AND t.currency = ${currency}
          AND t."createdAt" >= ${currentPeriodFilter.gte}
          AND t."createdAt" < ${currentPeriodFilter.lt}
        GROUP BY EXTRACT(HOUR FROM t."createdAt")
        ORDER BY hour ASC
      `;
      
      // Generate 24 hours of data, with current hour as last column
      const currentHour = new Date().getHours();
      const hours: Array<{ hour: number; label: string; transactions: number; revenue: number }> = [];
      
      for (let i = 0; i < 24; i++) {
        const hour = (currentHour + 1 + i) % 24; // Start from next hour after current
        const data = hourlyData.find(h => h.hour === hour);
        hours.push({
          hour: hour,
          label: `${hour.toString().padStart(2, '0')}:00`,
          transactions: data?.transactions || 0,
          revenue: data?.revenue || 0
        });
      }
      
      revenueTrend = hours.map(h => ({
        date: h.label,
        period: h.hour.toString(),
        transactions: h.transactions,
        revenue: h.revenue
      }));
      
    } else if (period === 'week') {
      // For week: Daily trends (7 columns) - today as last column
      const dailyData = await prisma.$queryRaw<Array<{ date: string; transactions: number; revenue: number }>>`
        SELECT 
          DATE(t."createdAt")::text as date,
          COUNT(*)::int as transactions,
          SUM(CAST(t."finalAmount" AS DECIMAL(10,2)))::float as revenue
        FROM "Transaction" t
        JOIN "Payment" p ON t.id = p."transactionId"
        WHERE 
          p.status = 'paid'
          AND t.currency = ${currency}
          AND t."createdAt" >= ${currentPeriodFilter.gte}
          AND t."createdAt" < ${currentPeriodFilter.lt}
        GROUP BY DATE(t."createdAt")
        ORDER BY date ASC
      `;
      
      // Generate 7 days of data, with today as last column
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days: Array<{ date: string; dayName: string; transactions: number; revenue: number }> = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const data = dailyData.find(d => d.date === dateStr);
        
        days.push({
          date: dateStr,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          transactions: data?.transactions || 0,
          revenue: data?.revenue || 0
        });
      }
      
      revenueTrend = days.map(d => ({
        date: d.dayName,
        period: d.date,
        transactions: d.transactions,
        revenue: d.revenue
      }));
      
    } else if (period === 'month') {
      // For month: Daily trends (29-31 columns) - today as last column
      const dailyData = await prisma.$queryRaw<Array<{ date: string; transactions: number; revenue: number }>>`
        SELECT 
          DATE(t."createdAt")::text as date,
          COUNT(*)::int as transactions,
          SUM(CAST(t."finalAmount" AS DECIMAL(10,2)))::float as revenue
        FROM "Transaction" t
        JOIN "Payment" p ON t.id = p."transactionId"
        WHERE 
          p.status = 'paid'
          AND t.currency = ${currency}
          AND t."createdAt" >= ${currentPeriodFilter.gte}
          AND t."createdAt" < ${currentPeriodFilter.lt}
        GROUP BY DATE(t."createdAt")
        ORDER BY date ASC
      `;
      
      // Generate all days in current month, with today as last column
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days: Array<{ date: string; dayLabel: string; transactions: number; revenue: number }> = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const data = dailyData.find(d => d.date === dateStr);
        
        days.push({
          date: dateStr,
          dayLabel: day.toString(),
          transactions: data?.transactions || 0,
          revenue: data?.revenue || 0
        });
      }
      
      revenueTrend = days.map(d => ({
        date: d.dayLabel,
        period: d.date,
        transactions: d.transactions,
        revenue: d.revenue
      }));
      
    } else {
      // For all time: Weekly trends - current week as last column
      const weeklyData = await prisma.$queryRaw<Array<{ week: string; year: number; transactions: number; revenue: number }>>`
        SELECT 
          EXTRACT(WEEK FROM t."createdAt")::text as week,
          EXTRACT(YEAR FROM t."createdAt")::int as year,
          COUNT(*)::int as transactions,
          SUM(CAST(t."finalAmount" AS DECIMAL(10,2)))::float as revenue
        FROM "Transaction" t
        JOIN "Payment" p ON t.id = p."transactionId"
        WHERE 
          p.status = 'paid'
          AND t.currency = ${currency}
          AND t."createdAt" >= ${currentPeriodFilter.gte}
          AND t."createdAt" < ${currentPeriodFilter.lt}
        GROUP BY EXTRACT(WEEK FROM t."createdAt"), EXTRACT(YEAR FROM t."createdAt")
        ORDER BY year ASC, week ASC
      `;
      
      // Generate weeks from first transaction to current week
      const currentDate = new Date();
      const currentWeek = Math.ceil(currentDate.getDate() / 7);
      const currentYear = currentDate.getFullYear();
      
      const weeks: Array<{ weekLabel: string; weekKey: string; transactions: number; revenue: number }> = [];
      
      weeklyData.forEach(w => {
        const weekLabel = `W${w.week}-${w.year}`;
        const weekKey = `${w.year}-${w.week}`;
        weeks.push({
          weekLabel: weekLabel,
          weekKey: weekKey,
          transactions: w.transactions,
          revenue: w.revenue
        });
      });
      
      revenueTrend = weeks.map(w => ({
        date: w.weekLabel,
        period: w.weekKey,
        transactions: w.transactions,
        revenue: w.revenue
      }));
    }

    // Process calculations
    const netRevenue = Number(revenueData._sum.finalAmount || 0);
    const grossRevenue = Number(revenueData._sum.originalAmount || 0);
    const totalDiscountGiven = Number(revenueData._sum.discountAmount || 0);
    const serviceFeeFromTransactions = Number(revenueData._sum.serviceFeeAmount || 0);
    const totalServiceFeeRevenue = Number(serviceFeeAnalytics._sum.serviceFee || 0);
    const avgOrderValue = Number(revenueData._avg.finalAmount || 0);
    const avgProcessingTimeMinutes = avgProcessingTimeData[0]?.avg_processing_time || 0;

    // Process WhatsApp subscription data
    let whatsappSubscriptions = {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      newSubscriptions: 0,
      subscriptionRate: 0,
      avgSubscriptionDuration: 0
    };

    if (whatsappSubscriptionData && whatsappSubscriptionData.length > 0) {
      // All data are already filtered for paid status, so totalCount = paidCount
      const totalCount = whatsappSubscriptionData.length;
      const paidCount = totalCount; // Since we already filtered for paid transactions
      
      // Get active/expired data from ServicesWhatsappCustomers for status info
      const [activeServices, totalAllTimeSubscriptions, avgDurationData] = await Promise.all([
        // Get current active/expired services
        prisma.servicesWhatsappCustomers.groupBy({
          by: ['status'],
          _count: {
            id: true
          }
        }),
        
        // Total all-time paid subscriptions from transactions
        prisma.transactionWhatsappService.count({
          where: {
            transaction: {
              currency: currency,
              OR: [
                { status: 'success' },
                { status: 'paid' }
              ]
            }
          }
        }),
        
        // Average subscription duration from services table
        prisma.$queryRaw<{avg_duration: number}[]>`
          SELECT AVG(
            EXTRACT(EPOCH FROM (COALESCE("expiredAt", NOW()) - "activatedAt")) / 86400
          )::float as avg_duration
          FROM "ServicesWhatsappCustomers"
        `
      ]);
      
      const activeCount = activeServices.find(s => s.status === 'active')?._count.id || 0;
      const expiredCount = activeServices.find(s => s.status === 'expired')?._count.id || 0;

      whatsappSubscriptions = {
        totalSubscriptions: totalCount,
        activeSubscriptions: activeCount,
        expiredSubscriptions: expiredCount,
        newSubscriptions: paidCount,
        subscriptionRate: totalAllTimeSubscriptions > 0 ? (paidCount / totalAllTimeSubscriptions) * 100 : 0,
        avgSubscriptionDuration: avgDurationData[0]?.avg_duration || 0
      };
    }

    // Calculate growth rates
    let revenueGrowthRate = 0;
    let transactionGrowthRate = 0;
    let userGrowthRate = 0;

    if (comparisonData) {
      if (comparisonData.revenue > 0) {
        revenueGrowthRate = ((netRevenue - comparisonData.revenue) / comparisonData.revenue) * 100;
      }
      if (comparisonData.transactions > 0) {
        transactionGrowthRate = ((completedTransactions - comparisonData.transactions) / comparisonData.transactions) * 100;
      }
      if (comparisonData.newUsers > 0) {
        userGrowthRate = ((newUsersCount - comparisonData.newUsers) / comparisonData.newUsers) * 100;
      }
    }

    // Calculate conversion rate
    const conversionRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

    // Find peak transaction hour (in WIB)
    let peakHour = { hour: 0, count: 0 };
    if (hourlyDistribution && hourlyDistribution.length > 0) {
      const utcPeakHour = hourlyDistribution.reduce((max, current) => 
        Number(current.count) > Number(max.count) ? current : max, 
        { hour: 0, count: 0 }
      );
      peakHour = {
        hour: getWIBHour(utcPeakHour.hour),
        count: utcPeakHour.count
      };
    } else {
      // Default to last transaction hour if no hourly data
      const lastTransaction = await prisma.transaction.findFirst({
        where: { currency: currency },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });
      if (lastTransaction) {
        const wibDate = new Date(lastTransaction.createdAt.getTime() + (7 * 60 * 60 * 1000));
        peakHour.hour = wibDate.getHours();
      }
    }

    // Process hourly distribution for WIB
    const processedHourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const hourData = hourlyDistribution.find(h => getWIBHour(h.hour) === hour);
      const count = hourData ? Number(hourData.count) : 0;
      return {
        hour: hour,
        count: count,
        percentage: totalTransactions > 0 ? Math.round((count / totalTransactions) * 10000) / 100 : 0
      };
    });

    // Process payment method breakdown (from raw SQL)
    const processedPaymentMethodBreakdown = paymentMethodBreakdown.map(method => ({
      method: method.method,
      count: Number(method.count),
      revenue: Number(method.total_amount || 0),
      percentage: completedTransactions > 0 ? Math.round((Number(method.count) / completedTransactions) * 10000) / 100 : 0
    }));

    // Process conversion funnel
    const processedConversionFunnel = conversionFunnel.map(status => ({
      status: status.status,
      count: Number(status._count.status),
      percentage: totalTransactions > 0 
        ? Math.round(((Number(status._count.status)) / totalTransactions) * 10000) / 100 
        : 0
    }));

    // Process top services - WhatsApp packages only
    const processedTopServices: any[] = [];
    
    // Get total revenue for WhatsApp package
    const getServiceRevenue = async (serviceId: string) => {
      // For WhatsApp services, sum up the finalAmount of transactions that contain this whatsapp package
      const revenueQuery = await prisma.transaction.aggregate({
        where: {
          whatsappTransaction: {
            whatsappPackageId: serviceId
          },
          payment: { status: 'paid' },
          createdAt: currentPeriodFilter,
          currency: currency
        },
        _sum: {
          finalAmount: true
        }
      });
      return Number(revenueQuery._sum?.finalAmount || 0);
    };
    
    // Process WhatsApp services - get package details for each grouped service
    if (topWhatsappData && topWhatsappData.length > 0) {
      const whatsappDetails = await Promise.all(
        topWhatsappData.map(async (whatsapp) => {
          if (!whatsapp.whatsappPackageId) return null;
          
          const packageInfo = await prisma.whatsappApiPackage.findUnique({
            where: { id: whatsapp.whatsappPackageId },
            select: {
              id: true,
              name: true,
              priceMonth: true
            }
          });
          
          if (packageInfo) {
            const revenue = await getServiceRevenue(whatsapp.whatsappPackageId);
            return {
              id: whatsapp.whatsappPackageId,
              serviceName: packageInfo.name,
              serviceType: 'whatsapp',
              orderCount: Number(whatsapp._count.whatsappPackageId),
              totalDuration: 1,
              totalRevenue: revenue,
              amount: packageInfo.priceMonth,
              price: packageInfo.priceMonth,
              currency: currency,
              period: period,
              avgOrderValue: whatsapp._count.whatsappPackageId > 0 ? revenue / whatsapp._count.whatsappPackageId : 0,
              date: new Date().toISOString()
            };
          }
          return null;
        })
      );
      
      whatsappDetails.forEach(detail => {
        if (detail) processedTopServices.push(detail);
      });
    }
    
    // Sort by order count descending and take top 10
    const sortedTopServices = processedTopServices.sort((a, b) => b.orderCount - a.orderCount).slice(0, 10);

    // Process recent transactions - WhatsApp only
    const processedRecentTransactions = recentTransactions.map((transaction: any) => {
      // Get WhatsApp package name
      let itemName = 'Unknown Item';
      
      if (transaction.whatsappTransaction) {
        itemName = transaction.whatsappTransaction.whatsappPackage?.name || 'WhatsApp Package';
      }

      return {
        id: transaction.id,
        userName: transaction.user?.name || 'Anonymous',
        userEmail: transaction.user?.email || 'No email',
        item: itemName,
        amount: Number(transaction.finalAmount || 0),
        originalAmount: Number(transaction.originalAmount || 0),
        discountAmount: Number(transaction.discountAmount || 0),
        serviceFeeAmount: Number(transaction.serviceFeeAmount || 0),
        transactionStatus: transaction.status,
        paymentStatus: transaction.payment?.status || 'pending',
        paymentMethod: transaction.payment?.method || 'unknown',
        currency: transaction.currency || 'idr',
        date: transaction.createdAt,
        formattedAmount: formatCurrency(Number(transaction.finalAmount || 0), transaction.currency || 'idr')
      };
    });

    // Voucher metrics - empty array (no addon support)
    const voucherMetrics: any[] = [];

    return withCORS(NextResponse.json({
      success: true,
      data: {
        period,
        currency,
        overview: {
          totalTransactions,
          completedTransactions,
          pendingTransactions,
          failedTransactions,
          conversionRate: Math.round(conversionRate * 100) / 100,
          newUsers: newUsersCount,
          totalActiveUsers: totalActiveUsersCount,
          avgProcessingTime: Math.round(avgProcessingTimeMinutes || 0),
          revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100,
          transactionGrowthRate: Math.round(transactionGrowthRate * 100) / 100,
          userGrowthRate: Math.round(userGrowthRate * 100) / 100,
          peakHour: peakHour.hour,
          totalServiceFeeRevenue
        },
        revenue: {
          totalRevenue: netRevenue,
          grossRevenue: grossRevenue,
          serviceFeeRevenue: totalServiceFeeRevenue,
          totalDiscountGiven: totalDiscountGiven,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          formattedRevenue: formatCurrency(netRevenue, currency),
          revenueGrowth: Math.round(revenueGrowthRate * 100) / 100
        },
        paymentMethods: processedPaymentMethodBreakdown,
        trends: {
          revenue: revenueTrend.map(item => ({
            date: item.date,
            period: item.period,
            transactions: Number(item.transactions),
            revenue: Number(item.revenue)
          })),
          daily: revenueTrend.map(item => ({
            date: item.date,
            transactions: Number(item.transactions),
            revenue: Number(item.revenue)
          })),
          type: period === 'today' ? 'hourly' : period === 'all_time' ? 'monthly' : 'daily',
          hourly: processedHourlyDistribution
        },
        vouchers: {
          totalUsages: voucherStats._count._all || 0,
          totalDiscount: totalDiscountGiven,
          formattedDiscount: formatCurrency(totalDiscountGiven, currency),
          period: period,
          periodLabel: period === 'today' ? 'hari ini' : 
                      period === 'week' ? '7 hari terakhir' :
                      period === 'month' ? '30 hari terakhir' : 'semua waktu',
          avgDiscountPerTransaction: voucherStats._count._all > 0 ? totalDiscountGiven / voucherStats._count._all : 0,
          discountRate: netRevenue > 0 ? (totalDiscountGiven / (netRevenue + totalDiscountGiven)) * 100 : 0,
          formattedAvgDiscount: formatCurrency(voucherStats._count._all > 0 ? totalDiscountGiven / voucherStats._count._all : 0, currency),
          metrics: voucherMetrics
        },
        whatsappSubscriptions: {
          totalSubscriptions: whatsappSubscriptions.totalSubscriptions,
          activeSubscriptions: whatsappSubscriptions.activeSubscriptions,
          expiredSubscriptions: whatsappSubscriptions.expiredSubscriptions,
          newSubscriptions: whatsappSubscriptions.newSubscriptions,
          subscriptionRate: Math.round(whatsappSubscriptions.subscriptionRate * 100) / 100,
          avgSubscriptionDuration: Math.round(whatsappSubscriptions.avgSubscriptionDuration)
        },
        categoryStats: categoryStats.map(cat => ({
          type: cat.type,
          _count: { id: cat._count.type },
          _sum: { finalAmount: cat._sum.finalAmount }
        })),
        topServices: sortedTopServices,
        recentTransactions: processedRecentTransactions,
        conversionFunnel: processedConversionFunnel,
        analytics: {
          totalServiceFeeRevenue,
          peakTransactionHour: peakHour.hour,
          conversionRate: Math.round(conversionRate * 100) / 100,
          avgProcessingTime: Math.round(avgProcessingTimeMinutes || 0),
          hourlyDistribution: processedHourlyDistribution,
          statusDistribution: processedConversionFunnel
        },
        categoryPerformance: {
          totalCategories: categoryStats.length,
          topCategory: categoryStats.length > 0 ? {
            type: categoryStats[0].type,
            revenue: Number(categoryStats[0]._sum.finalAmount || 0),
            transactions: categoryStats[0]._count.type
          } : null,
          categoryBreakdown: categoryStats.map(cat => ({
            type: cat.type,
            revenue: Number(cat._sum.finalAmount || 0),
            transactions: cat._count.type,
            percentage: netRevenue > 0 ? ((Number(cat._sum.finalAmount || 0) / netRevenue) * 100) : 0
          }))
        },
        revenueCostAnalysis: {
          grossRevenue: grossRevenue,
          netRevenue: netRevenue,
          serviceFeeRevenue: totalServiceFeeRevenue,
          discountCost: totalDiscountGiven,
          profitMargin: grossRevenue > 0 ? ((netRevenue / grossRevenue) * 100) : 0,
          serviceFeeMargin: grossRevenue > 0 ? ((totalServiceFeeRevenue / grossRevenue) * 100) : 0,
          discountRate: grossRevenue > 0 ? ((totalDiscountGiven / grossRevenue) * 100) : 0
        }
      }
    }));

  } catch (error) {
    console.error('Analytics API Error:', error);
    return withCORS(NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    ));
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse();
}
