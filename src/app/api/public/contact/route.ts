import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/services/mailer'
import { sendWhatsAppMessageDetailed } from '@/services/whatsapp-go'
import { withCORS } from '@/lib/cors'

interface ContactRequest {
  name: string
  email: string
  phone: string
  message: string
}

// Contact form email template
const getContactEmailTemplate = (data: ContactRequest) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: #23284e; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #374151; margin-bottom: 5px; display: block; }
            .value { color: #6b7280; line-height: 1.6; }
            .message-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">clivy.com</p>
            </div>
            
            <div class="content">
                <div class="field">
                    <span class="label">Name:</span>
                    <div class="value">${data.name}</div>
                </div>
                
                <div class="field">
                    <span class="label">Email:</span>
                    <div class="value">${data.email}</div>
                </div>
                
                <div class="field">
                    <span class="label">Phone:</span>
                    <div class="value">${data.phone}</div>
                </div>
                
                <div class="field">
                    <span class="label">Message:</span>
                    <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
            
            <div class="footer">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    This email was sent automatically from the contact form on clivy.com
                </p>
                <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} CLIVY. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}

// WhatsApp message template
const getWhatsAppMessage = (data: ContactRequest) => {
  return `🔔 *CONTACT FORM SUBMISSION* 🔔

👤 *Name:* ${data.name}
📧 *Email:* ${data.email}
📱 *Phone:* ${data.phone}

💬 *Message:*
${data.message}

---
📅 *Time:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
🌐 *Source:* clivy.com contact form

_This message was sent automatically from the website contact form._`
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.message) {
      return withCORS(
        NextResponse.json({
          success: false,
          error: 'All fields are required'
        }, { status: 400 })
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return withCORS(
        NextResponse.json({
          success: false,
          error: 'Invalid email format'
        }, { status: 400 })
      )
    }

    // Send email notification to admin
    const emailResult = await sendEmail({
      to: 'clivy@gmail.com',
      subject: `New Contact Form Submission from ${body.name}`,
      html: getContactEmailTemplate(body)
    })

    // Send WhatsApp notification to admin
    const whatsappResult = await sendWhatsAppMessageDetailed(
      '6281233784490', // Admin WhatsApp number
      getWhatsAppMessage(body)
    )

    // Check if at least one notification method succeeded
    const emailSuccess = emailResult.success
    const whatsappSuccess = whatsappResult.success

    if (!emailSuccess && !whatsappSuccess) {
      console.error('Contact form submission failed:', {
        email: emailResult.error,
        whatsapp: whatsappResult.error
      })
      
      return withCORS(
        NextResponse.json({
          success: false,
          error: 'Unable to send notification. Please try again or contact us directly.'
        }, { status: 500 })
      )
    }

    // Log partial failures but still return success
    if (!emailSuccess) {
      console.warn('Email notification failed for contact form:', emailResult.error)
    }
    if (!whatsappSuccess) {
      console.warn('WhatsApp notification failed for contact form:', whatsappResult.error)
    }

    return withCORS(
      NextResponse.json({
        success: true,
        message: 'Message sent successfully! We will get back to you soon.',
        notifications: {
          email: emailSuccess,
          whatsapp: whatsappSuccess
        }
      })
    )

  } catch (error) {
    console.error('Contact form API error:', error)
    
    return withCORS(
      NextResponse.json({
        success: false,
        error: 'Server error occurred. Please try again later.'
      }, { status: 500 })
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return withCORS(
    new NextResponse(null, { status: 200 })
  )
}