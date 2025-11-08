import { NextRequest, NextResponse } from "next/server";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getCustomerAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PaymentExpirationService } from "@/lib/payment-expiration";

// GET /api/customer/payment/[paymentId]/status - Get payment status details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ paymentId: string }> }
) {
    try {
        const userAuth = await getCustomerAuth(request);
        if (!userAuth?.id) {
        return withCORS(NextResponse.json(
            { success: false, error: "Authentication required. Please login first." },
            { status: 401 }
        ));
        }

        const resolvedParams = await params;
        const { paymentId } = resolvedParams;

        // Auto-expire this specific payment before fetching status
        await PaymentExpirationService.autoExpireOnApiCall(undefined, paymentId);

        // Get payment details with transaction and user validation
        const payment = await prisma.payment.findFirst({
        where: {
            id: paymentId,
            transaction: {
            userId: userAuth.id // Security: ensure user owns this payment
            }
        },
        include: {
            transaction: {
            include: {
                whatsappTransaction: {
                include: {
                    whatsappPackage: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        priceMonth: true,
                        priceYear: true
                    }
                    }
                }
                },
                voucher: true
            }
            }
        }
        });

        if (!payment || !payment.transaction) {
        return withCORS(NextResponse.json(
            { success: false, error: "Payment not found or access denied" },
            { status: 404 }
        ));
        }

        const transaction = payment.transaction;

        // Get payment method details
        const paymentMethod = await prisma.paymentMethod.findFirst({
        where: { code: payment.method },
        include: {
            bankDetail: true
        }
        });

        // Calculate pricing details
        const subtotal = Number(transaction.originalAmount || transaction.amount);
        const discountAmount = Number(transaction.discountAmount || 0);
        const totalAfterDiscount = Number(transaction.totalAfterDiscount || subtotal - discountAmount);
        const serviceFeeAmount = Number(payment.serviceFee || 0);
        const finalAmount = Number(payment.amount);

        // Determine payment status flags
        const statusInfo = {
        isPending: payment.status === 'pending',
        isCompleted: payment.status === 'paid',
        isFailed: payment.status === 'failed',
        isCancelled: payment.status === 'cancelled',
        canCancel: payment.status === 'pending',
        nextAction: payment.status === 'pending' ? 'Complete payment' : 
                    payment.status === 'paid' ? 'Payment completed' : 
                    'Contact support if needed'
        };

        // Build transaction items
        const items = [];

        // Add WhatsApp service
        if (transaction.whatsappTransaction?.whatsappPackage) {
        const whatsappPkg = transaction.whatsappTransaction.whatsappPackage;
        const duration = transaction.whatsappTransaction.duration;
        
        const priceMonth = whatsappPkg.priceMonth;
        const priceYear = whatsappPkg.priceYear;
        const price = duration === 'month' ? priceMonth : priceYear;
        
        items.push({
            type: 'whatsapp_service',
            name: whatsappPkg.name,
            category: 'WhatsApp API Service',
            subcategory: 'API Access',
            duration: duration,
            price: price,
            priceMonth: whatsappPkg.priceMonth,
            priceYear: whatsappPkg.priceYear,
            currency: 'idr',
            quantity: 1
        });
        }

        // Build additional info based on payment method type
        let additionalInfo;
        let instructions = '';

        // Check if it's a manual bank transfer method
        if (paymentMethod?.bankDetail) {
        // Manual bank transfer - use bank details
        instructions = `Transfer exactly Rp ${finalAmount.toLocaleString('id-ID')} to the account below:`;
        additionalInfo = {
            bankDetails: {
            bankName: paymentMethod.bankDetail.bankName,
            accountNumber: paymentMethod.bankDetail.accountNumber,
            accountName: paymentMethod.bankDetail.accountName,
            swiftCode: paymentMethod.bankDetail.swiftCode || '',
            currency: transaction.currency
            },
            note: 'Please transfer the exact amount and send payment proof to admin.',
            steps: [
            'Login to your internet banking or visit ATM',
            'Transfer to the account details above',
            'Use the exact amount shown',
            'Keep your transfer receipt',
            'Payment will be verified by admin within 1-24 hours'
            ]
        };
        } else if (payment.gatewayResponse && typeof payment.gatewayResponse === 'object') {
        // Gateway payment - use Duitku response data
        const gatewayData = payment.gatewayResponse as any;
        
        if (gatewayData.qrString) {
            // QRIS payment
            instructions = 'Scan the QR code below with your mobile banking app or e-wallet:';
            additionalInfo = {
            paymentType: 'qris',
            qrString: gatewayData.qrString,
            vaNumber: null,
            paymentUrl: payment.paymentUrl || gatewayData.paymentUrl,
            note: 'Scan QR code with mobile banking app or e-wallet (OVO, DANA, GoPay, ShopeePay, etc.)',
            steps: [
                'Open your mobile banking app or e-wallet',
                'Choose "Scan QR" or "Pay with QR"',
                'Scan the QR code shown',
                'Confirm the payment amount',
                'Complete the payment process'
            ]
            };
        } else if (gatewayData.vaNumber) {
            // Check if this is a retail method with specific instructions
            if (paymentMethod?.paymentInstructions && 
                (payment.method === 'FT' || payment.method === 'IR' || 
                 payment.method.includes('alfamart') || payment.method.includes('indomaret'))) {
                // Retail payment method - use database instructions
                instructions = `Complete payment at ${paymentMethod.name} outlets:`;
                additionalInfo = {
                paymentType: 'retail',
                qrString: null,
                vaNumber: gatewayData.vaNumber,
                paymentUrl: payment.paymentUrl || gatewayData.paymentUrl,
                note: 'Visit the retail outlet to complete payment',
                steps: [
                    'Visit the nearest retail outlet',
                    'Provide the payment code to the cashier',
                    'Pay the exact amount in cash',
                    'Keep your receipt for verification'
                ]
                };
            } else {
                // Regular Virtual Account payment
                instructions = 'Use the Virtual Account number below to complete payment:';
                additionalInfo = {
                paymentType: 'virtual_account',
                qrString: null,
                vaNumber: gatewayData.vaNumber,
                paymentUrl: payment.paymentUrl || gatewayData.paymentUrl,
                note: 'Transfer to Virtual Account number via ATM, internet banking, or mobile banking',
                steps: [
                    'Login to your internet banking or mobile banking',
                    'Choose "Transfer" menu',
                    'Enter the Virtual Account number above',
                    'Enter the exact payment amount',
                    'Confirm and complete the transfer'
                ]
                };
            }
        } else if (payment.paymentUrl || gatewayData.paymentUrl) {
            // Other gateway payment with URL
            instructions = 'Click the payment link below to complete your payment:';
            additionalInfo = {
            paymentType: 'gateway_url',
            qrString: null,
            vaNumber: null,
            paymentUrl: payment.paymentUrl || gatewayData.paymentUrl,
            note: 'You will be redirected to secure payment page',
            steps: [
                'Click the payment button below',
                'You will be redirected to secure payment page',
                'Choose your preferred payment method',
                'Complete the payment process',
                'Return to this page to check payment status'
            ]
            };
        } else {
            // Fallback for other gateway methods
            instructions = 'Please complete your payment using the selected method.';
            additionalInfo = {
            paymentType: 'gateway_other',
            qrString: null,
            vaNumber: null,
            paymentUrl: payment.paymentUrl,
            note: 'Follow the payment instructions for your selected method',
            steps: []
            };
        }
        } else {
        // Fallback for unknown payment methods
        instructions = 'Please complete your payment using the selected method.';
        additionalInfo = {
            note: 'Please contact support if you need assistance with payment',
            steps: []
        };
        }

        // Build response
        const response = {
        success: true,
        data: {
            payment: {
            id: payment.id,
            transactionId: payment.transactionId,
            amount: Number(payment.amount),
            method: payment.method,
            methodName: paymentMethod?.name || payment.method.replace(/_/g, ' '), // Human-readable name
            status: payment.status,
            paymentUrl: payment.paymentUrl,
            externalId: payment.externalId,
            createdAt: payment.createdAt,
            expiresAt: payment.expiresAt, // Add expiresAt field
            gatewayResponse: payment.gatewayResponse || {},
            gatewayProvider: payment.gatewayProvider || '',
            paymentInstructions: paymentMethod?.paymentInstructions || '',
            instructionType: paymentMethod?.instructionType || '',
            instructionImageUrl: paymentMethod?.instructionImageUrl || ''
            },
            transaction: {
            id: transaction.id,
            currency: transaction.currency,
            status: transaction.status,
            type: transaction.type,
            notes: transaction.notes
            },
            pricing: {
            subtotal: subtotal,
            discountAmount: discountAmount,
            totalAfterDiscount: totalAfterDiscount,
            serviceFee: {
                paymentMethod: payment.method,
                method: paymentMethod?.name || payment.method,
                type: paymentMethod?.feeType || 'fixed',
                value: Number(paymentMethod?.feeValue || 0),
                amount: serviceFeeAmount,
                currency: transaction.currency,
                description: paymentMethod?.feeType === 'percentage' 
                ? `${paymentMethod.feeValue}% service fee`
                : `Fixed service fee`
            },
            finalAmount: finalAmount,
            currency: transaction.currency
            },
            items: items,
            voucher: transaction.voucher ? {
            code: transaction.voucher.code,
            name: transaction.voucher.name,
            discountAmount: discountAmount
            } : null,
            instructions: instructions,
            additionalInfo: additionalInfo,
            gatewayResponse: payment.gatewayResponse,
            bankDetails: paymentMethod?.bankDetail ? {
            bankName: paymentMethod.bankDetail.bankName,
            accountNumber: paymentMethod.bankDetail.accountNumber,
            accountName: paymentMethod.bankDetail.accountName,
            swiftCode: paymentMethod.bankDetail.swiftCode || '',
            currency: transaction.currency
            } : null,
            serviceFeeInfo: {
            instructions: paymentMethod?.paymentInstructions || '',
            instructionType: paymentMethod?.instructionType || '',
            instructionImageUrl: paymentMethod?.instructionImageUrl || '',
            gatewayImageUrl: paymentMethod?.gatewayImageUrl || '', // Add gateway image URL
            feeType: paymentMethod?.feeType || '',
            feeValue: paymentMethod?.feeValue || '',
            minFee: paymentMethod?.minFee || null,
            maxFee: paymentMethod?.maxFee || null
            },
            statusInfo: statusInfo,
            subscriptionInfo: {
            activated: false,
            activationResult: null,
            message: payment.status === 'paid' ? 'Services will be activated automatically' : 'Complete payment to activate services'
            }
        },
        message: `Payment status retrieved successfully`
        };

        return withCORS(NextResponse.json(response));

    } catch (error) {
        console.error("[PAYMENT_STATUS_ERROR]", error);
        
        return withCORS(NextResponse.json(
        { success: false, error: "Failed to fetch payment status" },
        { status: 500 }
        ));
    }
}

export async function OPTIONS() {
    return corsOptionsResponse();
}
