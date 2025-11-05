import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth, getCustomerAuthErrorResponse } from "@/lib/auth-helpers";

export async function OPTIONS() {
  return corsOptionsResponse();
}

// GET /api/customer/my-packages - Get user's delivered packages
export async function GET(request: NextRequest) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    // console.log('[MY_PACKAGES_API] Fetching packages for user:', userAuth.id);

    // Get all package deliveries for this user from ServicesProductCustomers
    const packageDeliveries = await prisma.servicesProductCustomers.findMany({
      where: { 
        customerId: userAuth.id,
        // Only get packages from successful transactions
        transaction: {
          status: {
            in: ['in_progress', 'success']
          }
        }
      },
      include: {
        package: {
          select: {
            id: true,
            name_en: true,
            name_id: true,
            description_en: true,
            description_id: true,
            price_idr: true,
            price_usd: true,
            image: true,
            features: {
              select: {
                id: true,
                name_en: true,
                name_id: true,
                included: true,
              }
            },
            category: {
              select: {
                id: true,
                name_en: true,
                name_id: true,
              }
            },
            subcategory: {
              select: {
                id: true,
                name_en: true,
                name_id: true,
              }
            },
          }
        },
        transaction: {
          select: {
            id: true,
            amount: true,
            finalAmount: true,
            currency: true,
            status: true,
            transactionDate: true,
            payment: {
              select: {
                id: true,
                method: true,
                status: true,
                paymentDate: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // console.log('[MY_PACKAGES_API] Found', packageDeliveries.length, 'package deliveries');[MY_ADDONS_API]

    // Transform the data to match frontend expectations
    const transformedPackages = packageDeliveries.map(delivery => ({
      id: delivery.id,
      transactionId: delivery.transactionId,
      packageId: delivery.packageId,
      quantity: delivery.quantity,
      status: delivery.status, // awaiting_delivery, in_progress, delivered
      deliveredAt: delivery.deliveredAt?.toISOString(),
      websiteUrl: delivery.websiteUrl,
      driveUrl: delivery.driveUrl,
      textDescription: delivery.textDescription,
      domainName: delivery.domainName,
      domainExpiredAt: delivery.domainExpiredAt?.toISOString(),
      notes: delivery.notes,
      createdAt: delivery.createdAt.toISOString(),
      updatedAt: delivery.updatedAt.toISOString(),
      package: delivery.package ? {
        id: delivery.package.id,
        name_en: delivery.package.name_en,
        name_id: delivery.package.name_id,
        description_en: delivery.package.description_en,
        description_id: delivery.package.description_id,
        price_idr: Number(delivery.package.price_idr),
        price_usd: Number(delivery.package.price_usd),
        image: delivery.package.image,
        features: delivery.package.features?.map(feature => ({
          id: feature.id,
          name_en: feature.name_en,
          name_id: feature.name_id,
          included: feature.included,
        })) || [],
        category: delivery.package.category ? {
          id: delivery.package.category.id,
          name_en: delivery.package.category.name_en,
          name_id: delivery.package.category.name_id,
        } : null,
        subcategory: delivery.package.subcategory ? {
          id: delivery.package.subcategory.id,
          name_en: delivery.package.subcategory.name_en,
          name_id: delivery.package.subcategory.name_id,
        } : null,
      } : null,
      transaction: delivery.transaction ? {
        id: delivery.transaction.id,
        amount: Number(delivery.transaction.amount),
        finalAmount: delivery.transaction.finalAmount ? Number(delivery.transaction.finalAmount) : undefined,
        currency: delivery.transaction.currency,
        status: delivery.transaction.status,
        transactionDate: delivery.transaction.transactionDate.toISOString(),
        payment: delivery.transaction.payment ? {
          id: delivery.transaction.payment.id,
          method: delivery.transaction.payment.method,
          status: delivery.transaction.payment.status,
          paymentDate: delivery.transaction.payment.paymentDate?.toISOString(),
        } : undefined,
      } : null,
    }));

    return withCORS(NextResponse.json({
      success: true,
      data: transformedPackages,
      message: `Found ${transformedPackages.length} packages`,
    }));
  } catch (error) {
    console.error("[MY_PACKAGES_GET] Error:", error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') {
      return withCORS(NextResponse.json({
        success: false,
        error: "Database temporarily unavailable. Please try again later.",
        code: "DATABASE_UNAVAILABLE"
      }, { status: 500 }));
    }
    
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch packages" },
      { status: 500 }
    ));
  }
}
