/**
 * Payment Notification Service
 * Handles sending notifications when payments are created and when payment status changes
 */

import { whatsappGoService } from '@/services/whatsapp-go';
import { EmailNotificationService } from '@/services/email-notification';

interface PaymentItem {
  name: string;
  quantity: number;
  price: number;
  type: 'package' | 'addon' | 'whatsapp_service';
  category?: string;
  duration?: string;
}

interface PaymentNotificationData {
  paymentId: string;
  customerName: string;
  customerPhone: string;
  items: PaymentItem[];
  subtotal: number;
  discountAmount: number;
  serviceFeeAmount: number;
  finalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentMethodName: string;
  paymentUrl?: string;
  expiresAt: Date;
  instructions: string;
  paymentCode?: string; // For VA/retail methods
  qrAvailable?: boolean; // For QRIS methods
}

export class PaymentNotificationService {
    /**
     * Send WhatsApp notification to customer when payment is created
     */
    static async sendPaymentCreatedNotification(data: PaymentNotificationData): Promise<boolean> {
        try {
        console.log(`[PAYMENT_NOTIFICATION] Received data: paymentId=${data.paymentId}, customerName=${data.customerName}, customerPhone="${data.customerPhone}"`);
        
        if (!data.customerPhone) {
            console.log('[PAYMENT_NOTIFICATION] No phone number provided');
            return false;
        }

        const message = this.buildPaymentMessage(data);
        
        console.log(`[PAYMENT_NOTIFICATION] Sending WhatsApp notification to ${data.customerPhone} for payment ${data.paymentId}`);
        // Use system message with auto-recovery for critical payment notifications
        const result = await whatsappGoService.sendSystemMessage(data.customerPhone, message);
        
        if (result.success) {
            console.log(`[PAYMENT_NOTIFICATION] WhatsApp notification sent successfully to ${data.customerPhone} for payment ${data.paymentId}`);
            return true;
        } else {
            console.error(`[PAYMENT_NOTIFICATION] Failed to send WhatsApp notification (auto-recovery attempted):`, result.error);
            return false;
        }
        } catch (error) {
        console.error('[PAYMENT_NOTIFICATION] Error sending payment notification:', error);
        return false;
        }
    }

    /**
     * Build payment notification message
     */
    private static buildPaymentMessage(data: PaymentNotificationData): string {
        const currencySymbol = data.currency.toUpperCase() === 'IDR' ? 'Rp' : '$';
        const statusPageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/status/${data.paymentId}`;
        
        // Format items
        const itemsList = data.items.map(item => {
        let itemText = `• ${item.name}`;
        if (item.quantity > 1) {
            itemText += ` (${item.quantity}x)`;
        }
        if (item.type === 'whatsapp_service' && item.duration) {
            itemText += ` - ${item.duration === 'month' ? 'Bulanan' : 'Tahunan'}`;
        }
        return itemText;
        }).join('\n');

        // Determine payment method description
        let paymentMethodDesc = '';
        let paymentAction = '';
        
        if (data.qrAvailable) {
        paymentMethodDesc = `Method: ${data.paymentMethodName} (QRIS)`;
        paymentAction = 'Scan QRIS in your payment page.';
        } else if (data.paymentCode) {
        paymentMethodDesc = `Method: ${data.paymentMethodName}`;
        if (data.paymentMethodName.toLowerCase().includes('virtual account') || 
            data.paymentMethodName.toLowerCase().includes('va')) {
            paymentAction = `Use This Virtual Account number to transfer.\nVirtual Account number: ${data.paymentCode}`;
        } else if (data.paymentMethodName.toLowerCase().includes('indomaret') || 
                    data.paymentMethodName.toLowerCase().includes('alfamart')) {
            paymentAction = `Pay at retail outlets with the payment code.\nPayment code: ${data.paymentCode}`;
        } else {
            paymentAction = `Payment code: ${data.paymentCode}`;
        }
        } else if (data.paymentUrl) {
        paymentMethodDesc = `Method: ${data.paymentMethodName}`;
        paymentAction = 'Click the payment link to continue.';
        } else {
        paymentMethodDesc = `Method: ${data.paymentMethodName}`;
        paymentAction = 'See payment instructions on the following page.';
        }

        // Calculate expiry time
        const now = new Date();
        const expiryTime = new Date(data.expiresAt);
        const timeDiff = Math.floor((expiryTime.getTime() - now.getTime()) / (1000 * 60)); // minutes
        
        let expiryText = '';
        if (timeDiff > 0) {
        if (timeDiff < 60) {
            expiryText = `⏰ Payment in ${timeDiff} minutes`;
        } else if (timeDiff < 1440) {
            const hours = Math.floor(timeDiff / 60);
            const minutes = timeDiff % 60;
            expiryText = `⏰ Payment in ${hours}h ${minutes}m`;
        } else {
            const days = Math.floor(timeDiff / 1440);
            const hours = Math.floor((timeDiff % 1440) / 60);
            expiryText = `⏰ Payment in ${days}d ${hours}h`;
        }
        } else {
        expiryText = '⏰ Payment has expired';
        }

        // Build message
        let message = `*NEW ORDER - GENFITY*\n\n`;
        message += `Hello ${data.customerName}! 👋\n\n`;
        // message += `Thank you for your order.\n\n`;


        message += `*ORDER DETAILS:*\n`;
        message += `${itemsList}\n\n`;

        // message += `*PRICE DETAILS:*\n`;
        // message += `Subtotal: ${currencySymbol} ${data.subtotal.toLocaleString('id-ID')}\n`;
        
        // if (data.discountAmount > 0) {
        // message += `Discount: -${currencySymbol} ${data.discountAmount.toLocaleString('id-ID')}\n`;
        // }
        
        // if (data.serviceFeeAmount > 0) {
        // message += `Admin Fee: ${currencySymbol} ${data.serviceFeeAmount.toLocaleString('id-ID')}\n`;
        // }

        message += `*Total: ${currencySymbol} ${data.finalAmount.toLocaleString('id-ID')}*\n\n`;

        message += `*PAYMENT:*\n`;
        message += `${paymentMethodDesc}\n`;
        message += `${paymentAction}\n\n`;
        
        message += `${expiryText}\n\n`;
        
        message += `*Payment Link:*\n`;
        message += `${statusPageUrl}\n\n`;
        
        // message += `Butuh bantuan? Hubungi customer service kami.\n\n`;
        message += `Thank you! 🙏`;

        return message;
    }

    /**
     * Send payment status update notification
     */
    static async sendPaymentStatusNotification(
        customerPhone: string,
        customerName: string,
        paymentId: string,
        status: 'paid' | 'failed' | 'expired' | 'cancelled',
        amount: number,
        currency: string
    ): Promise<boolean> {
        try {
        if (!customerPhone) {
            console.log('[PAYMENT_NOTIFICATION] No phone number provided');
            return false;
        }

        const currencySymbol = currency.toUpperCase() === 'IDR' ? 'Rp' : '$';
        let message = '';

        switch (status) {
            case 'paid':
            message = `*PAYMENT SUCCESS - GENFITY*\n\n`;
            message += `Hello ${customerName}! 🎉\n\n`;
            message += `Your payment of ${currencySymbol} ${amount.toLocaleString('id-ID')} has been successfully confirmed.\n\n`;
            message += `Your order is being processed and will be activated soon.\n\n`;
            message += `Thank you for your trust! 🙏`;
            break;

            case 'failed':
            message = `*PAYMENT FAILED - GENFITY*\n\n`;
            message += `Hello ${customerName},\n\n`;
            message += `Your payment of ${currencySymbol} ${amount.toLocaleString('id-ID')} could not be processed.\n\n`;
            message += `Please try again or use a different payment method.\n\n`;
            message += `📞 Need help? Contact our customer service.`;
            break;

            case 'expired':
            message = `*PAYMENT EXPIRED - GENFITY*\n\n`;
            message += `Hello ${customerName},\n\n`;
            message += `The payment time for the order of ${currencySymbol} ${amount.toLocaleString('id-ID')} has expired.\n\n`;
            message += `You can create a new order at any time.\n\n`;
            message += `Thank you! 🙏`;
            break;

            case 'cancelled':
            message = `*PAYMENT CANCELLED - GENFITY*\n\n`;
            message += `Hello ${customerName},\n\n`;
            message += `Your payment of ${currencySymbol} ${amount.toLocaleString('id-ID')} has been cancelled.\n\n`;
            message += `You can create a new order at any time.\n\n`;
            message += `Thank you! 🙏`;
            break;
        }

        console.log(`[PAYMENT_NOTIFICATION] Sending status notification to ${customerPhone} for payment ${paymentId}`);
        // Use system message with auto-recovery for critical payment status notifications
        const result = await whatsappGoService.sendSystemMessage(customerPhone, message);
        
        if (result.success) {
            console.log(`[PAYMENT_NOTIFICATION] Status notification sent successfully to ${customerPhone} for payment ${paymentId}`);
            return true;
        } else {
            console.error(`[PAYMENT_NOTIFICATION] Failed to send status notification (auto-recovery attempted):`, result.error);
            return false;
        }
        } catch (error) {
        console.error('[PAYMENT_NOTIFICATION] Error sending status notification:', error);
        return false;
        }
    }

    /**
     * Send comprehensive payment success notifications (WhatsApp + Email)
     */
    static async sendPaymentSuccessNotifications(data: {
        paymentId: string;
        transactionId: string;
        customerName: string;
        customerEmail?: string;
        customerPhone?: string;
        items: PaymentItem[];
        subtotal: number;
        discountAmount: number;
        serviceFeeAmount: number;
        finalAmount: number;
        currency: string;
        paymentMethod: string;
        paymentMethodName: string;
        paymentDate: Date;
        orderDate: Date;
    }): Promise<{ whatsappSent: boolean; emailSent: boolean }> {
        const results = { whatsappSent: false, emailSent: false };

        try {
            // Send WhatsApp notification
            if (data.customerPhone) {
                const whatsappMessage = this.buildPaymentSuccessWhatsAppMessage(data);
                console.log(`[PAYMENT_SUCCESS] Sending WhatsApp notification to ${data.customerPhone} for payment ${data.paymentId}`);
                
                // Use system message with auto-recovery for critical payment success notifications
                const whatsappResult = await whatsappGoService.sendSystemMessage(data.customerPhone, whatsappMessage);
                results.whatsappSent = whatsappResult.success;
                
                if (whatsappResult.success) {
                    console.log(`[PAYMENT_SUCCESS] WhatsApp notification sent successfully to ${data.customerPhone}`);
                } else {
                    console.error(`[PAYMENT_SUCCESS] Failed to send WhatsApp notification:`, whatsappResult.error);
                }
            } else {
                console.log(`[PAYMENT_SUCCESS] No phone number provided for payment ${data.paymentId}`);
            }

            // Send Email notification
            if (data.customerEmail) {
                console.log(`[PAYMENT_SUCCESS] Sending email notification to ${data.customerEmail} for payment ${data.paymentId}`);
                
                // Ensure customerEmail is not undefined for type safety
                const emailData = {
                    ...data,
                    customerEmail: data.customerEmail // TypeScript knows this is string here
                };
                
                const emailResult = await EmailNotificationService.sendPaymentSuccessEmail(emailData);
                results.emailSent = emailResult;
                
                if (emailResult) {
                    console.log(`[PAYMENT_SUCCESS] Email notification sent successfully to ${data.customerEmail}`);
                } else {
                    console.error(`[PAYMENT_SUCCESS] Failed to send email notification to ${data.customerEmail}`);
                }
            } else {
                console.log(`[PAYMENT_SUCCESS] No email address provided for payment ${data.paymentId}`);
            }

            console.log(`[PAYMENT_SUCCESS] Notification summary for payment ${data.paymentId}: WhatsApp=${results.whatsappSent}, Email=${results.emailSent}`);
            return results;

        } catch (error) {
            console.error('[PAYMENT_SUCCESS] Error sending payment success notifications:', error);
            return results;
        }
    }

    /**
     * Build WhatsApp message for payment success
     */
    private static buildPaymentSuccessWhatsAppMessage(data: {
        paymentId: string;
        transactionId: string;
        customerName: string;
        items: PaymentItem[];
        subtotal: number;
        discountAmount: number;
        serviceFeeAmount: number;
        finalAmount: number;
        currency: string;
        paymentMethodName: string;
        paymentDate: Date;
    }): string {
        const currencySymbol = data.currency.toUpperCase() === 'IDR' ? 'Rp' : '$';
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
        
        // Format items
        const itemsList = data.items.map(item => {
            let itemText = `• ${item.name}`;
            if (item.quantity > 1) {
                itemText += ` (${item.quantity}x)`;
            }
            if (item.type === 'whatsapp_service' && item.duration) {
                itemText += ` - ${item.duration === 'month' ? 'Bulanan' : 'Tahunan'}`;
            }
            return itemText;
        }).join('\n');

        // Format payment method description (same as in buildPaymentMessage)
        const paymentMethodDesc = `Metode: ${data.paymentMethodName}`;

        // Build success message
        let message = `*PAYMENT SUCCESS - GENFITY*\n\n`;
        message += `Hello ${data.customerName}!\n\n`;
        message += `Your payment has been confirmed and your order is being processed!\n\n`;

        // message += `*ORDER DETAILS:*\n`;
        // message += `${itemsList}\n\n`;

        // message += `*PAYMENT DETAILS:*\n`;
        // message += `Subtotal: ${currencySymbol} ${data.subtotal.toLocaleString('id-ID')}\n`;
        
        // if (data.discountAmount > 0) {
        //     message += `Discount: -${currencySymbol} ${data.discountAmount.toLocaleString('id-ID')}\n`;
        // }
        
        // if (data.serviceFeeAmount > 0) {
        //     message += `Admin Fee: ${currencySymbol} ${data.serviceFeeAmount.toLocaleString('id-ID')}\n`;
        // }

        // message += `*TOTAL PAID : ${currencySymbol} ${data.finalAmount.toLocaleString('id-ID')}*\n\n`;

        // message += `*PAYMENT METHOD:*\n`;
        // message += `${paymentMethodDesc}\n`;
        // message += `Date: ${data.paymentDate.toLocaleDateString('id-ID', { 
        //     day: 'numeric', 
        //     month: 'long', 
        //     year: 'numeric',
        //     hour: '2-digit',
        //     minute: '2-digit'
        // })}\n\n`;

        // message += `🔗 *DASHBOARD:*\n`;
        // message += `${dashboardUrl}\n\n`;
        
        message += `Thank you for your trust! 🙏`;

        return message;
    }
}
