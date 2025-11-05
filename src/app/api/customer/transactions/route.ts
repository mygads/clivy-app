import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth, getCustomerAuthErrorResponse } from "@/lib/auth-helpers";
import { PaymentExpirationService } from "@/lib/payment-expiration";
import { z } from "zod";
import { detectCurrencySync } from "@/lib/currency-detection";

const createTransactionSchema = z.object({
  packageId: z.string().cuid().optional(),
  addonId: z.string().cuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  referenceLink: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
}).refine(data => data.packageId || data.addonId, {
  message: "Either packageId or addonId must be provided",
});

export async function OPTIONS() {
  return corsOptionsResponse();
}

// GET /api/customer/transactions - Get user's transactions
export async function GET(request: NextRequest) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    // Auto-expire all payments and transactions
    await PaymentExpirationService.autoExpireOnApiCall();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const whereClause: any = { userId: userAuth.id };
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // console.log('[TRANSACTIONS_API] Fetching transactions for user:', userAuth.id, 'with filters:', whereClause);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          productTransactions: {
            include: {
              package: {
                select: {
                  id: true,
                  name_en: true,
                  name_id: true,
                  price_idr: true,
                  price_usd: true,
                  image: true,
                  category: true,
                  subcategory: true,
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
                  priceMonth_idr: true,
                  priceMonth_usd: true,
                  priceYear_idr: true,
                  priceYear_usd: true,
                  description: true,
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
        },
        orderBy: { transactionDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    // console.log('[TRANSACTIONS_API] Found', transactions.length, 'transactions out of', total, 'total');

    // Transform the data to match frontend expectations
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      type: transaction.type,
      notes: transaction.notes,
      transactionDate: transaction.transactionDate.toISOString(),
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
      } : null,
      productTransactions: transaction.productTransactions?.map(pt => ({
        id: pt.id,
        quantity: pt.quantity,
        status: pt.status,
        package: pt.package ? {
          id: pt.package.id,
          name_en: pt.package.name_en,
          name_id: pt.package.name_id,
          price_idr: Number(pt.package.price_idr),
          price_usd: Number(pt.package.price_usd),
          image: pt.package.image,
          category: pt.package.category,
          subcategory: pt.package.subcategory,
        } : null,
      })) || [],
      addonTransactions: transaction.addonTransactions?.map(at => ({
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
      voucher: transaction.voucher ? {
        id: transaction.voucher.id,
        code: transaction.voucher.code,
        name: transaction.voucher.name,
        type: transaction.voucher.type,
        value: Number(transaction.voucher.value),
      } : null,
    }));

    return withCORS(NextResponse.json({
      success: true,
      data: transformedTransactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
      message: `Found ${transformedTransactions.length} transactions`,
    }));
  } catch (error) {
    console.error("[CUSTOMER_TRANSACTIONS_GET] Error:", error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') {
      return withCORS(NextResponse.json({
        success: false,
        error: "Database temporarily unavailable. Please try again later.",
        code: "DATABASE_UNAVAILABLE"
      }, { status: 500 }));
    }
    
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    ));
  }
}

// POST /api/customer/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const userAuth = await getCustomerAuth(request);
    if (!userAuth) {
      return withCORS(NextResponse.json(
        getCustomerAuthErrorResponse(),
        { status: 401 }
      ));
    }

    const body = await request.json();
    const validation = createTransactionSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { packageId, addonId, startDate, endDate, referenceLink, notes } = validation.data;

    // Verify the package or addon exists and get pricing
    let item = null;
    let amount = 0;

    if (packageId) {
      item = await prisma.package.findUnique({
        where: { id: packageId },
        select: { id: true, name_en: true, price_idr: true, price_usd: true },
      });
      if (!item) {
        return withCORS(NextResponse.json(
          { success: false, error: "Package not found" },
          { status: 404 }
        ));
      }
      amount = Number(item.price_idr);
    } else if (addonId) {
      item = await prisma.addon.findUnique({
        where: { id: addonId },
        select: { id: true, name_en: true, price_idr: true, price_usd: true },
      });
      if (!item) {
        return withCORS(NextResponse.json(
          { success: false, error: "Addon not found" },
          { status: 404 }
        ));
      }
      amount = Number(item.price_idr);
    }    // Create transaction with payment record
    const transaction = await prisma.transaction.create({
      data: {
        userId: userAuth.id,
        amount,
        status: 'created', // Use consolidated status system
        type: 'product',
        notes: notes || null,
        payment: {
          create: {
            amount,
            method: 'pending', // Will be updated when payment method is chosen
            status: 'pending',
          },
        },        productTransactions: {
          create: {
            packageId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            referenceLink,
            quantity: 1,
          },
        },
      },
      include: {        productTransactions: {
          include: {
            package: {
              select: {
                id: true,
                name_en: true,
                name_id: true,
                price_idr: true,
                price_usd: true,
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
                price_idr: true,
                price_usd: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    return withCORS(NextResponse.json({
      success: true,
      data: transaction,
      message: "Transaction created successfully",
    }));
  } catch (error) {
    console.error("[CUSTOMER_TRANSACTIONS_POST]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to create transaction" },
      { status: 500 }
    ));
  }
}
