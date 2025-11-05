import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth, getCustomerAuthErrorResponse } from "@/lib/auth-helpers";
import { PaymentExpirationService } from "@/lib/payment-expiration";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;
    const userAuth = await getCustomerAuth(request);
    if (!userAuth) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    // Auto-expire all payments and transactions
    await PaymentExpirationService.autoExpireOnApiCall();

    // console.log('[TRANSACTION_DETAIL_API] Fetching transaction:', transactionId, 'for user:', userAuth.id);

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: userAuth.id, // Ensure user can only access their own transactions
      },
      include: {
        productTransactions: {
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
                category: true,
                subcategory: true,
                features: {
                  select: {
                    id: true,
                    name_en: true,
                    name_id: true,
                    included: true,
                  },
                },
              },
            },
          },
        },
        addonTransactions: {
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
                category: true,
              },
            },
          },
        },
        whatsappTransaction: {
          include: {
            whatsappPackage: {
              select: {
                id: true,
                name: true,
                description: true,
                priceMonth_idr: true,
                priceMonth_usd: true,
                priceYear_idr: true,
                priceYear_usd: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paymentDate: true,
            createdAt: true,
            expiresAt: true,
            externalId: true,
            paymentUrl: true,
          },
        },
        voucher: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            value: true,
          },
        },
        // Include actual delivery service statuses from service customer tables
        productCustomers: {
          select: {
            id: true,
            packageId: true,
            quantity: true,
            status: true,
            websiteUrl: true,
            driveUrl: true,
            textDescription: true,
            domainName: true,
            domainExpiredAt: true,
            fileAssets: true,
            deliveredAt: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
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
                category: true,
                subcategory: true,
              },
            },
          },
        },
        // Include actual addon service statuses from service customer tables
        addonCustomers: {
          select: {
            id: true,
            addonDetails: true,
            status: true,
            driveUrl: true,
            fileAssets: true,
            deliveredAt: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!transaction) {
      return withCORS(NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      ));
    }

    // console.log('[TRANSACTION_DETAIL_API] Found transaction:', transaction.id);
    // console.log('[TRANSACTION_DETAIL_API] ProductCustomers:', transaction.productCustomers?.length);
    // console.log('[TRANSACTION_DETAIL_API] AddonCustomers:', transaction.addonCustomers?.length);

    // Transform the data to match frontend expectations (same as list endpoint)
    const transformedTransaction = {
      id: transaction.id,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      type: transaction.type,
      notes: transaction.notes,
      transactionDate: transaction.transactionDate.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      discountAmount: transaction.discountAmount ? Number(transaction.discountAmount) : 0,
      serviceFeeAmount: transaction.serviceFeeAmount ? Number(transaction.serviceFeeAmount) : 0,
      finalAmount: transaction.finalAmount ? Number(transaction.finalAmount) : Number(transaction.amount),
      expiresAt: transaction.expiresAt?.toISOString(),
      payment: transaction.payment ? {
        id: transaction.payment.id,
        amount: Number(transaction.payment.amount),
        method: transaction.payment.method,
        status: transaction.payment.status,
        paymentDate: transaction.payment.paymentDate?.toISOString(),
        createdAt: transaction.payment.createdAt.toISOString(),
        expiresAt: transaction.payment.expiresAt?.toISOString(),
        externalId: transaction.payment.externalId,
        paymentUrl: transaction.payment.paymentUrl,
      } : null,
      productTransactions: transaction.productTransactions?.map((pt: any) => ({
        id: pt.id,
        quantity: pt.quantity,
        status: pt.status,
        startDate: pt.startDate?.toISOString(),
        endDate: pt.endDate?.toISOString(),
        referenceLink: pt.referenceLink,
        package: pt.package ? {
          id: pt.package.id,
          name_en: pt.package.name_en,
          name_id: pt.package.name_id,
          price_idr: Number(pt.package.price_idr),
          price_usd: Number(pt.package.price_usd),
          image: pt.package.image,
          category: pt.package.category,
          subcategory: pt.package.subcategory,
          description_en: pt.package.description_en,
          description_id: pt.package.description_id,
          features: pt.package.features?.map((f: any) => ({
            id: f.id,
            name_en: f.name_en,
            name_id: f.name_id,
            included: f.included,
          })) || [],
        } : null,
      })) || [],
      addonTransactions: transaction.addonTransactions?.map((at: any) => ({
        id: at.id,
        quantity: at.quantity,
        status: at.status,
        addon: at.addon ? {
          id: at.addon.id,
          name_en: at.addon.name_en,
          name_id: at.addon.name_id,
          price_idr: Number(at.addon.price_idr),
          price_usd: Number(at.addon.price_usd),
          image: at.addon.image,
          category: at.addon.category,
          description_en: at.addon.description_en,
          description_id: at.addon.description_id,
        } : null,
      })) || [],
      whatsappTransaction: transaction.whatsappTransaction ? {
        id: transaction.whatsappTransaction.id,
        duration: transaction.whatsappTransaction.duration,
        status: transaction.whatsappTransaction.status,
        whatsappPackage: transaction.whatsappTransaction.whatsappPackage ? {
          id: transaction.whatsappTransaction.whatsappPackage.id,
          name: transaction.whatsappTransaction.whatsappPackage.name,
          priceMonth_idr: Number(transaction.whatsappTransaction.whatsappPackage.priceMonth_idr),
          priceMonth_usd: Number(transaction.whatsappTransaction.whatsappPackage.priceMonth_usd),
          priceYear_idr: Number(transaction.whatsappTransaction.whatsappPackage.priceYear_idr),
          priceYear_usd: Number(transaction.whatsappTransaction.whatsappPackage.priceYear_usd),
          description: transaction.whatsappTransaction.whatsappPackage.description,
        } : null,
      } : null,
      // Add actual delivery service statuses
      productDeliveries: transaction.productCustomers?.map((pc: any) => ({
        id: pc.id,
        packageId: pc.packageId,
        quantity: pc.quantity,
        status: pc.status,
        websiteUrl: pc.websiteUrl,
        driveUrl: pc.driveUrl,
        textDescription: pc.textDescription,
        domainName: pc.domainName,
        domainExpiredAt: pc.domainExpiredAt?.toISOString(),
        fileAssets: pc.fileAssets,
        deliveredAt: pc.deliveredAt?.toISOString(),
        notes: pc.notes,
        createdAt: pc.createdAt.toISOString(),
        updatedAt: pc.updatedAt.toISOString(),
        package: pc.package ? {
          id: pc.package.id,
          name_en: pc.package.name_en,
          name_id: pc.package.name_id,
          description_en: pc.package.description_en,
          description_id: pc.package.description_id,
          price_idr: Number(pc.package.price_idr),
          price_usd: Number(pc.package.price_usd),
          image: pc.package.image,
          category: pc.package.category,
          subcategory: pc.package.subcategory,
        } : null,
      })) || [],
      addonDeliveries: transaction.addonCustomers?.map((ac: any) => ({
        id: ac.id,
        addonDetails: ac.addonDetails,
        status: ac.status,
        driveUrl: ac.driveUrl,
        fileAssets: ac.fileAssets,
        deliveredAt: ac.deliveredAt?.toISOString(),
        notes: ac.notes,
        createdAt: ac.createdAt.toISOString(),
        updatedAt: ac.updatedAt.toISOString(),
      })) || [],
      voucher: transaction.voucher ? {
        id: transaction.voucher.id,
        code: transaction.voucher.code,
        name: transaction.voucher.name,
        type: transaction.voucher.type,
        value: Number(transaction.voucher.value),
      } : null,
      // Build item_name for display
      item_name: (() => {
        const items = [];
        transaction.productTransactions?.forEach((pt: any) => {
          if (pt.package) {
            items.push(pt.package.name_en || pt.package.name_id);
          }
        });
        transaction.addonTransactions?.forEach((at: any) => {
          if (at.addon) {
            items.push(at.addon.name_en || at.addon.name_id);
          }
        });
        if (transaction.whatsappTransaction?.whatsappPackage) {
          items.push(`${transaction.whatsappTransaction.whatsappPackage.name} (${transaction.whatsappTransaction.duration})`);
        }
        return items.join(', ');
      })(),
    };

    // Reset finalAmount and serviceFeeAmount if payment is cancelled/failed/expired
    // This ensures fresh calculations when user returns to checkout
    if (transaction.payment && ['cancelled', 'failed', 'expired'].includes(transaction.payment.status)) {
      transformedTransaction.finalAmount = Number(transaction.amount);
      transformedTransaction.serviceFeeAmount = 0;
    }

    return withCORS(NextResponse.json({
      success: true,
      data: transformedTransaction,
      message: "Transaction details retrieved successfully",
    }));
  } catch (error) {
    console.error("[CUSTOMER_TRANSACTION_DETAILS_GET]", error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') {
      return withCORS(NextResponse.json({
        success: false,
        error: "Database temporarily unavailable. Please try again later.",
        code: "DATABASE_UNAVAILABLE"
      }, { status: 500 }));
    }
    
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch transaction details" },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
