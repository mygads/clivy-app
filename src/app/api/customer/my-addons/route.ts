import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth, getCustomerAuthErrorResponse } from "@/lib/auth-helpers";
import { MyAddon, MyAddonStats } from "@/components/my-addons/types";

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

    const { searchParams } = new URL(request.url);
    
    // Check if requesting all data (for frontend filtering)
    const fetchAll = searchParams.get('all') === 'true';
    
    // Parse query parameters (only used when not fetching all)
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const hasDrive = searchParams.get('hasDrive') || 'all';
    const sortBy = searchParams.get('sortBy') || 'transactionDate';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // console.log('[MY_ADDONS_API] Fetching addons for user:', userAuth.id);

    // First, get all addon deliveries for this customer
    const addonDeliveries = await prisma.servicesAddonsCustomers.findMany({
      where: {
        customerId: userAuth.id
      },
      include: {
        transaction: {
          select: {
            id: true,
            status: true,
            amount: true,
            finalAmount: true,
            currency: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            },
            payment: {
              select: {
                method: true
              }
            }
          }
        }
      }
    });

    // console.log('[MY_ADDONS_API] Found', addonDeliveries.length, 'addon deliveries');

    // Parse addon details and build the response
    const allAddons: MyAddon[] = [];

    for (const delivery of addonDeliveries) {
      try {
        // Get transaction addons for this delivery
        const transactionAddons = await prisma.transactionAddons.findMany({
          where: {
            transactionId: delivery.transactionId
          },
          include: {
            addon: {
              select: {
                id: true,
                name_en: true,
                name_id: true,
                description_en: true,
                description_id: true,
                price_idr: true,
                price_usd: true,
                image: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name_en: true,
                    name_id: true
                  }
                }
              }
            }
          }
        });

        // Create addon entries for each addon in the transaction
        for (const transactionAddon of transactionAddons) {
          const currency = delivery.transaction.currency || 'idr';
          const unitPrice = currency === 'usd' 
            ? Number(transactionAddon.addon.price_usd) 
            : Number(transactionAddon.addon.price_idr);
          const addonTotalPrice = unitPrice * transactionAddon.quantity;

          allAddons.push({
            id: `${delivery.id}_${transactionAddon.id}`,
            addonId: transactionAddon.addonId,
            transactionId: delivery.transactionId,
            customerId: delivery.customerId,
            quantity: transactionAddon.quantity,
            totalPrice: addonTotalPrice,
            status: delivery.status as 'pending' | 'inprogress' | 'complete',
            driveUrl: delivery.driveUrl,
            deliveredAt: delivery.deliveredAt?.toISOString() || null,
            createdAt: delivery.createdAt.toISOString(),
            updatedAt: delivery.updatedAt.toISOString(),
            addon: {
              id: transactionAddon.addon.id,
              name_en: transactionAddon.addon.name_en,
              name_id: transactionAddon.addon.name_id,
              description_en: transactionAddon.addon.description_en || '',
              description_id: transactionAddon.addon.description_id || '',
              price: unitPrice,
              image: transactionAddon.addon.image || undefined,
              isActive: true, // Default value since not in schema
              createdAt: new Date().toISOString(), // Default value
              updatedAt: new Date().toISOString(), // Default value
              category: {
                id: transactionAddon.addon.category.id,
                name_en: transactionAddon.addon.category.name_en,
                name_id: transactionAddon.addon.category.name_id,
                description_en: '', // Default value since not available
                description_id: '', // Default value since not available
                isActive: true, // Default value
                createdAt: new Date().toISOString(), // Default value
                updatedAt: new Date().toISOString() // Default value
              }
            },
            transaction: {
              id: delivery.transaction.id,
              status: delivery.transaction.status,
              paymentMethod: delivery.transaction.payment?.method || 'N/A',
              totalAmount: Number(delivery.transaction.finalAmount || delivery.transaction.amount),
              createdAt: delivery.transaction.createdAt.toISOString(),
              updatedAt: delivery.transaction.updatedAt.toISOString()
            }
          });
        }
      } catch (error) {
        console.error('[MY_ADDONS_API] Error processing delivery:', delivery.id, error);
        // Skip this delivery if we can't process it
        continue;
      }
    }

    // Apply filters and sorting only if not fetching all data
    let filteredAddons = allAddons;

    if (!fetchAll) {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredAddons = filteredAddons.filter(addon =>
          addon.addon.name_en.toLowerCase().includes(searchLower) ||
          addon.addon.name_id.toLowerCase().includes(searchLower) ||
          addon.addon.category.name_en.toLowerCase().includes(searchLower) ||
          addon.addon.category.name_id.toLowerCase().includes(searchLower) ||
          addon.transactionId.toLowerCase().includes(searchLower)
        );
      }

      // Status filter
      if (status && status !== 'all') {
        filteredAddons = filteredAddons.filter(addon => addon.status === status);
      }

      // Category filter
      if (category) {
        const categoryLower = category.toLowerCase();
        filteredAddons = filteredAddons.filter(addon =>
          addon.addon.category.name_en.toLowerCase().includes(categoryLower) ||
          addon.addon.category.name_id.toLowerCase().includes(categoryLower)
        );
      }

      // Date range filter
      if (dateFrom || dateTo) {
        filteredAddons = filteredAddons.filter(addon => {
          const addonDate = new Date(addon.createdAt);
          
          if (dateFrom && addonDate < new Date(dateFrom)) return false;
          if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59, 999);
            if (addonDate > endDate) return false;
          }
          
          return true;
        });
      }

      // Price range filter
      if (priceMin || priceMax) {
        filteredAddons = filteredAddons.filter(addon => {
          if (priceMin && addon.totalPrice < parseFloat(priceMin)) return false;
          if (priceMax && addon.totalPrice > parseFloat(priceMax)) return false;
          return true;
        });
      }

      // Drive URL filter
      if (hasDrive === 'yes') {
        filteredAddons = filteredAddons.filter(addon => addon.driveUrl !== null);
      } else if (hasDrive === 'no') {
        filteredAddons = filteredAddons.filter(addon => addon.driveUrl === null);
      }

      // Sort the results
      filteredAddons.sort((a, b) => {
        switch (sortBy) {
          case 'transactionDate':
            const dateComparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return sortDirection === 'desc' ? -dateComparison : dateComparison;
          case 'status':
            const statusComparison = a.status.localeCompare(b.status);
            return sortDirection === 'desc' ? -statusComparison : statusComparison;
          case 'totalPrice':
            const priceComparison = a.totalPrice - b.totalPrice;
            return sortDirection === 'desc' ? -priceComparison : priceComparison;
          case 'deliveredAt':
            const deliveredA = a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0;
            const deliveredB = b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0;
            const deliveredComparison = deliveredA - deliveredB;
            return sortDirection === 'desc' ? -deliveredComparison : deliveredComparison;
          default:
            const defaultComparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return sortDirection === 'desc' ? -defaultComparison : defaultComparison;
        }
      });
    }

    // Apply pagination only if not fetching all data
    let finalAddons = filteredAddons;
    let pagination;

    if (!fetchAll) {
      const totalResults = filteredAddons.length;
      const totalPages = Math.ceil(totalResults / limit);
      const skip = (page - 1) * limit;
      finalAddons = filteredAddons.slice(skip, skip + limit);

      pagination = {
        currentPage: page,
        totalPages,
        totalCount: totalResults,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    }

    // Calculate stats
    const stats: MyAddonStats = {
      total: 0,
      complete: 0,
      pending: 0,
      inprogress: 0
    };

    // Count stats from all deliveries
    const statusCounts = await prisma.servicesAddonsCustomers.groupBy({
      by: ['status'],
      where: {
        customerId: userAuth.id
      },
      _count: {
        id: true
      }
    });

    statusCounts.forEach((stat) => {
      const count = stat._count.id;
      stats.total += count;
      
      switch (stat.status) {
        case 'delivered':
          stats.complete = count;
          break;
        case 'pending':
          stats.pending = count;
          break;
        case 'in_progress':
          stats.inprogress = count;
          break;
      }
    });

    const response = {
      success: true,
      data: finalAddons,
      stats,
      ...(pagination && { pagination }),
      ...(fetchAll ? {} : {
        filters: {
          search,
          status,
          category,
          dateFrom,
          dateTo,
          priceMin,
          priceMax,
          hasDrive,
          sortBy,
          sortDirection
        }
      })
    };

    return withCORS(NextResponse.json(response));

  } catch (error) {
    console.error("Error fetching my addons:", error);
    
    return withCORS(
      NextResponse.json(
        {
          success: false,
          error: "Failed to fetch addons data",
          message: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      )
    );
  }
}
