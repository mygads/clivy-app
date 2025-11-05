import { NextRequest, NextResponse } from "next/server";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

/**
 * DUITKU PAYMENT REDIRECT/RETURN HANDLER
 * 
 * This endpoint handles the return URL from Duitku after payment.
 * According to Duitku documentation, users are redirected here after payment completion.
 * 
 * URL Format: /payment/result?merchantOrderId=xxx&resultCode=xx&reference=xxx
 * 
 * Result Codes:
 * - 00: Success
 * - 01: Pending  
 * - 02: Canceled
 * 
 * Note: Do NOT use resultCode to update payment status in database.
 * This is only for displaying result to user. Use callback for actual status updates.
 */

// GET /api/public/duitku/return - Handle payment return/redirect
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const merchantOrderId = searchParams.get('merchantOrderId');
    const resultCode = searchParams.get('resultCode');
    const reference = searchParams.get('reference');

    console.log('[DUITKU_RETURN] Return received:', {
      merchantOrderId,
      resultCode,
      reference
    });

    // Find payment record using reference or merchantOrderId
    let payment = null;
    
    if (reference) {
      payment = await prisma.payment.findFirst({
        where: { externalId: reference },
        include: {
          transaction: {
            include: {
              user: true
            }
          }
        }
      });
    }

    if (!payment && merchantOrderId) {
      // Try to find by matching pattern in external ID or payment ID
      payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { externalId: { contains: merchantOrderId } },
            { id: merchantOrderId }
          ]
        },
        include: {
          transaction: {
            include: {
              user: true
            }
          }
        }
      });
    }

    // Determine status message for user display
    let statusMessage = 'Payment status unknown';
    let statusType = 'info';

    switch (resultCode) {
      case '00':
        statusMessage = 'Payment successful! Your transaction is being processed.';
        statusType = 'success';
        break;
      case '01':
        statusMessage = 'Payment is pending. Please wait for confirmation.';
        statusType = 'warning';
        break;
      case '02':
        statusMessage = 'Payment was canceled or failed.';
        statusType = 'error';
        break;
      default:
        statusMessage = 'Payment completed. Please check your transaction status.';
        statusType = 'info';
    }

    // Build response data
    const responseData = {
      success: true,
      data: {
        merchantOrderId,
        reference,
        resultCode,
        statusMessage,
        statusType,
        payment: payment ? {
          id: payment.id,
          transactionId: payment.transactionId,
          status: payment.status,
          amount: Number(payment.amount),
          method: payment.method,
          createdAt: payment.createdAt,
        } : null,
        redirectUrl: payment 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/payment/status/${payment.id}`
          : `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?message=Payment not found`
      },
      message: statusMessage
    };

    // For API calls, return JSON response
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('application/json')) {
      return withCORS(NextResponse.json(responseData));
    }

    // For browser redirects, redirect to payment status page
    const frontendUrl = payment 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/payment/status/${payment.id}?status=${resultCode}&ref=${reference}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?merchantOrderId=${merchantOrderId}&resultCode=${resultCode}&reference=${reference}&message=Payment not found`;

    return NextResponse.redirect(frontendUrl);

  } catch (error) {
    console.error('[DUITKU_RETURN] Error:', error);
    
    // For API calls, return error response
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('application/json')) {
      return withCORS(NextResponse.json(
        { success: false, error: 'Failed to process payment return' },
        { status: 500 }
      ));
    }

    // For browser redirects, redirect to error page
    const errorUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?message=Failed to process payment return`;
    return NextResponse.redirect(errorUrl);
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
