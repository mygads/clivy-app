/**
 * Email Notification Service
 * Handles sending email notifications for various payment events
 */

import { sendEmail } from '@/services/mailer';

interface PaymentItem {
  name: string;
  quantity: number;
  price: number;
  type: 'package' | 'addon' | 'whatsapp_service';
  category?: string;
  duration?: string;
}

interface PaymentSuccessEmailData {
  paymentId: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
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
}

export class EmailNotificationService {
    /**
     * Send payment success email notification
     */
    static async sendPaymentSuccessEmail(data: PaymentSuccessEmailData): Promise<boolean> {
        try {
            if (!data.customerEmail) {
                console.log('[EMAIL_NOTIFICATION] No email address provided');
                return false;
            }

            const subject = `Payment Confirmation - Order #${data.transactionId.slice(-8).toUpperCase()}`;
            const htmlContent = this.buildPaymentSuccessEmailHTML(data);

            console.log(`[EMAIL_NOTIFICATION] Sending payment success email to ${data.customerEmail} for payment ${data.paymentId}`);
            
            const result = await sendEmail({
                to: data.customerEmail,
                subject: subject,
                html: htmlContent
            });

            if (result.success) {
                console.log(`[EMAIL_NOTIFICATION] Payment success email sent successfully to ${data.customerEmail} for payment ${data.paymentId}`);
                return true;
            } else {
                console.error(`[EMAIL_NOTIFICATION] Failed to send payment success email:`, result.error);
                return false;
            }
        } catch (error) {
            console.error('[EMAIL_NOTIFICATION] Error sending payment success email:', error);
            return false;
        }
    }

    /**
     * Build payment success email HTML content
     */
    private static buildPaymentSuccessEmailHTML(data: PaymentSuccessEmailData): string {
        const currencySymbol = data.currency.toUpperCase() === 'IDR' ? 'Rp' : '$';
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

        // Payment method description (remove code prefix)
        const paymentMethodDesc = data.paymentMethodName;

        // English locale formatting
        const locale = 'en-US';
        const orderDateFormatted = data.orderDate.toLocaleString(locale, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const paymentDateFormatted = data.paymentDate.toLocaleString(locale, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Debug items and ensure proper rendering
        console.log('[EMAIL_DEBUG] Items data:', JSON.stringify(data.items, null, 2));
        
        // Format items with proper data handling
        const itemsRows = data.items && data.items.length > 0 
            ? data.items.map(item => {
                let itemName = item.name || 'Unknown Item';
                if (item.type === 'whatsapp_service' && item.duration) {
                    itemName += ` (${item.duration === 'month' ? 'Monthly' : 'Annual'})`;
                }
                const quantity = item.quantity || 1;
                const price = item.price || 0;
                const total = price * quantity;
                
                return `
                    <tr>
                        <td class="item">${itemName}</td>
                        <td class="qty">${quantity}</td>
                        <td class="price">${currencySymbol} ${price.toLocaleString(locale)}</td>
                        <td class="total">${currencySymbol} ${total.toLocaleString(locale)}</td>
                    </tr>`;
            }).join('')
            : `<tr><td colspan="4" class="no-items">No items found</td></tr>`;

        // Payment summary rows
        const discountRow = data.discountAmount > 0 ? `
            <div class="summary-row discount">
                <span>Discount</span>
                <span>-${currencySymbol} ${data.discountAmount.toLocaleString(locale)}</span>
            </div>` : '';
        
        const feeRow = data.serviceFeeAmount > 0 ? `
            <div class="summary-row">
                <span>Service Fee</span>
                <span>${currencySymbol} ${data.serviceFeeAmount.toLocaleString(locale)}</span>
            </div>` : '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>Payment Confirmation</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            margin: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            background: #f8fafc; 
            color: #1e293b; 
            line-height: 1.6;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
            color: white; 
            padding: 40px 32px; 
            text-align: center; 
        }
        .success-badge { 
            display: inline-block; 
            background: rgba(255, 255, 255, 0.2); 
            padding: 6px 16px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600; 
            letter-spacing: 0.5px; 
            text-transform: uppercase; 
            margin-bottom: 16px;
        }
        .header h1 { 
            margin: 0 0 8px; 
            font-size: 28px; 
            font-weight: 700; 
        }
        .header p { 
            margin: 0; 
            font-size: 16px; 
            opacity: 0.9; 
        }
        
        .content { padding: 32px; }
        .section { margin-bottom: 32px; }
        .section:last-child { margin-bottom: 0; }
        
        .section-title { 
            font-size: 18px; 
            font-weight: 600; 
            color: #374151; 
            margin: 0 0 16px; 
            padding-bottom: 8px; 
            border-bottom: 2px solid #e5e7eb; 
        }
        
        /* Order Information Grid */
        .order-info { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 16px; 
            margin-bottom: 20px; 
        }
        .info-item { 
            background: #f8fafc; 
            padding: 16px; 
            border-radius: 8px; 
            border-left: 4px solid #4f46e5; 
        }
        .info-label { 
            font-size: 12px; 
            font-weight: 600; 
            color: #6b7280; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            margin-bottom: 4px; 
        }
        .info-value { 
            font-size: 14px; 
            font-weight: 600; 
            color: #1f2937; 
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; 
        }
        
        /* Items Table */
        .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 16px 0; 
            border-radius: 8px; 
            overflow: hidden; 
            border: 1px solid #e5e7eb; 
        }
        .items-table th { 
            background: #f1f5f9; 
            padding: 12px 16px; 
            text-align: left; 
            font-weight: 600; 
            font-size: 13px; 
            color: #374151; 
            border-bottom: 1px solid #e5e7eb; 
        }
        .items-table th.qty, .items-table td.qty { text-align: center; }
        .items-table th.price, .items-table th.total, 
        .items-table td.price, .items-table td.total { text-align: right; }
        .items-table td { 
            padding: 16px; 
            border-bottom: 1px solid #f1f5f9; 
            vertical-align: top; 
        }
        .items-table tr:last-child td { border-bottom: none; }
        .items-table td.item { font-weight: 500; color: #1f2937; }
        .items-table td.no-items { 
            text-align: center; 
            color: #6b7280; 
            font-style: italic; 
            padding: 24px; 
        }
        
        /* Payment Summary */
        .payment-summary { 
            background: #f8fafc; 
            border: 1px solid #e5e7eb; 
            border-radius: 12px; 
            padding: 24px; 
            margin: 20px 0; 
        }
        .summary-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 8px 0; 
            font-size: 14px; 
        }
        .summary-row.discount span:last-child { color: #dc2626; font-weight: 600; }
        .summary-row.total { 
            border-top: 2px solid #e5e7eb; 
            margin-top: 12px; 
            padding-top: 16px; 
            font-size: 18px; 
            font-weight: 700; 
        }
        .summary-row.total span:last-child { color: #059669; }
        
        /* Payment Method */
        .payment-method { 
            background: #eff6ff; 
            border: 1px solid #dbeafe; 
            border-radius: 8px; 
            padding: 16px; 
            text-align: center; 
            font-weight: 600; 
            color: #1e40af; 
        }
        
        /* Next Steps */
        .next-steps { 
            background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); 
            border: 1px solid #bbf7d0; 
            border-radius: 12px; 
            padding: 24px; 
            text-align: center; 
        }
        .next-steps h4 { 
            margin: 0 0 16px; 
            font-size: 18px; 
            color: #065f46; 
        }
        .steps-list { 
            list-style: none; 
            padding: 0; 
            margin: 0 0 24px; 
        }
        .steps-list li { 
            background: white; 
            margin: 8px 0; 
            padding: 12px 16px; 
            border-radius: 8px; 
            border-left: 4px solid #10b981; 
            text-align: left; 
            font-size: 14px; 
            color: #374151; 
        }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
            color: white !important; 
            padding: 16px 32px; 
            border-radius: 8px; 
            text-decoration: none; 
            font-weight: 600; 
            font-size: 16px; 
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); 
            transition: transform 0.2s ease; 
        }
        .cta-button:hover { transform: translateY(-2px); }
        
        /* Footer */
        .footer { 
            background: #1f2937; 
            color: #d1d5db; 
            padding: 32px; 
            text-align: center; 
        }
        .footer .brand { 
            font-size: 20px; 
            font-weight: 700; 
            color: white; 
            margin-bottom: 8px; 
        }
        .footer .tagline { 
            font-size: 14px; 
            margin-bottom: 16px; 
            opacity: 0.8; 
        }
        .footer .contact { 
            font-size: 12px; 
            opacity: 0.6; 
            line-height: 1.5; 
        }
        
        /* Mobile Responsive */
        @media (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header, .content, .footer { padding: 24px 20px; }
            .order-info { grid-template-columns: 1fr; gap: 12px; }
            .items-table { font-size: 13px; }
            .items-table th, .items-table td { padding: 12px 8px; }
            .payment-summary { padding: 20px; }
            .next-steps { padding: 20px; }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            body { background: #0f172a; }
            .container { background: #1e293b; }
            .section-title { color: #f1f5f9; border-color: #475569; }
            .info-item { background: #334155; }
            .info-value { color: #f1f5f9; }
            .items-table { border-color: #475569; }
            .items-table th { background: #334155; color: #f1f5f9; border-color: #475569; }
            .items-table td { border-color: #334155; }
            .items-table td.item { color: #f1f5f9; }
            .payment-summary { background: #334155; border-color: #475569; }
            .payment-method { background: #1e3a8a; border-color: #1d4ed8; color: #dbeafe; }
            .next-steps { background: #064e3b; border-color: #065f46; }
            .next-steps h4 { color: #a7f3d0; }
            .steps-list li { background: #374151; color: #d1d5db; border-color: #10b981; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-badge">Payment Successful</div>
            <h1>Thank you, ${data.customerName}!</h1>
            <p>Your order is being processed</p>
        </div>

        <div class="content">
            <!-- Order Information -->
            <div class="section">
                <h3 class="section-title">Order Information</h3>
                <div class="order-info">
                    <div class="info-item">
                        <div class="info-label">Order ID</div>
                        <div class="info-value">#${data.transactionId.slice(-8).toUpperCase()}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment ID</div>
                        <div class="info-value">${data.paymentId.slice(-8).toUpperCase()}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Order Date</div>
                        <div class="info-value">${orderDateFormatted}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment Date</div>
                        <div class="info-value">${paymentDateFormatted}</div>
                    </div>
                </div>
            </div>

            <!-- Order Items -->
            <div class="section">
                <h3 class="section-title">Order Items</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="item">Item</th>
                            <th class="qty">Qty</th>
                            <th class="price">Price</th>
                            <th class="total">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>
            </div>

            <!-- Payment Summary -->
            <div class="section">
                <h3 class="section-title">Payment Summary</h3>
                <div class="payment-summary">
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>${currencySymbol} ${data.subtotal.toLocaleString(locale)}</span>
                    </div>
                    ${discountRow}
                    ${feeRow}
                    <div class="summary-row total">
                        <span>Total Paid</span>
                        <span>${currencySymbol} ${data.finalAmount.toLocaleString(locale)}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Method -->
            <div class="section">
                <h3 class="section-title">Payment Method</h3>
                <div class="payment-method">${paymentMethodDesc}</div>
            </div>

            <!-- Next Steps -->
            <div class="section">
                <div class="next-steps">
                    <h4>🎉 What's Next?</h4>
                    <ul class="steps-list">
                        <li>✅ Your services are being activated automatically</li>
                        <li>📧 You'll receive access details within 5-10 minutes</li>
                        <li>📊 Check your dashboard for real-time status updates</li>
                        <li>💬 Contact support if you need any assistance</li>
                    </ul>
                    <a href="${dashboardUrl}" class="cta-button">Open Dashboard</a>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="brand">Genfity</div>
            <div class="tagline">Thank you for choosing our services. We're here to help you grow!</div>
            <div class="contact">
                Questions? Email us at support@genfity.com<br/>
                © ${new Date().getFullYear()} Genfity. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Send payment failed email notification
     */
    static async sendPaymentFailedEmail(
        customerEmail: string,
        customerName: string,
        paymentId: string,
        transactionId: string,
        amount: number,
        currency: string,
        paymentMethod: string
    ): Promise<boolean> {
        try {
            if (!customerEmail) {
                console.log('[EMAIL_NOTIFICATION] No email address provided');
                return false;
            }

            const currencySymbol = currency.toUpperCase() === 'IDR' ? 'Rp' : '$';
            const subject = `Payment Failed - Order #${transactionId.slice(-8).toUpperCase()}`;
            
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Payment Failed</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We couldn't process your payment</p>
    </div>

    <div style="background: white; padding: 30px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
        <p>Hello ${customerName},</p>
        
        <p>Unfortunately, we couldn't process your payment of <strong>${currencySymbol} ${amount.toLocaleString()}</strong> using <strong>${paymentMethod}</strong>.</p>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #b91c1c;"><strong>Payment ID:</strong> ${paymentId.slice(-8).toUpperCase()}</p>
            <p style="margin: 5px 0 0 0; color: #b91c1c;"><strong>Order ID:</strong> #${transactionId.slice(-8).toUpperCase()}</p>
        </div>

        <p><strong>What you can do:</strong></p>
        <ul>
            <li>Try again with the same payment method</li>
            <li>Use a different payment method</li>
            <li>Contact your bank if the issue persists</li>
            <li>Contact our customer support for assistance</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Try Again
            </a>
        </div>
    </div>

    <div style="background: #1f2937; color: #d1d5db; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} Genfity. All rights reserved.
        </p>
    </div>

</body>
</html>
            `;

            const result = await sendEmail({
                to: customerEmail,
                subject: subject,
                html: htmlContent
            });

            if (result.success) {
                console.log(`[EMAIL_NOTIFICATION] Payment failed email sent successfully to ${customerEmail} for payment ${paymentId}`);
                return true;
            } else {
                console.error(`[EMAIL_NOTIFICATION] Failed to send payment failed email:`, result.error);
                return false;
            }
        } catch (error) {
            console.error('[EMAIL_NOTIFICATION] Error sending payment failed email:', error);
            return false;
        }
    }
}
