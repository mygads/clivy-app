import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/services/mailer'
import { sendWhatsAppMessageDetailed } from '@/services/whatsapp-go'
import { withCORS } from '@/lib/cors'

interface AppointmentRequest {
  name: string
  email: string
  phone: string
  company?: string
  service: string
  preferredDate: string
  preferredTime: string
  message: string
}

// Appointment email template
const getAppointmentEmailTemplate = (data: AppointmentRequest) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Appointment Request</title>
        <style>
            body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: #23284e; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #374151; margin-bottom: 5px; display: block; }
            .value { color: #6b7280; line-height: 1.6; }
            .message-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; }
            .highlight { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            .urgent { color: #dc2626; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 24px;">🗓️ New Appointment Request</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">clivy.com</p>
            </div>
            
            <div class="content">
                <div class="highlight">
                    <p style="margin: 0; text-align: center;" class="urgent">
                        ⚡ URGENT: New appointment request requires your attention
                    </p>
                </div>

                <div class="field">
                    <span class="label">👤 Client Name:</span>
                    <div class="value">${data.name}</div>
                </div>
                
                <div class="field">
                    <span class="label">📧 Email:</span>
                    <div class="value">${data.email}</div>
                </div>
                
                <div class="field">
                    <span class="label">📱 Phone:</span>
                    <div class="value">${data.phone}</div>
                </div>

                ${data.company ? `
                <div class="field">
                    <span class="label">🏢 Company:</span>
                    <div class="value">${data.company}</div>
                </div>
                ` : ''}
                
                <div class="field">
                    <span class="label">🎯 Service Interest:</span>
                    <div class="value">${data.service}</div>
                </div>

                <div class="field">
                    <span class="label">📅 Preferred Date:</span>
                    <div class="value">${new Date(data.preferredDate).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</div>
                </div>

                <div class="field">
                    <span class="label">⏰ Preferred Time:</span>
                    <div class="value">${data.preferredTime}</div>
                </div>
                
                <div class="field">
                    <span class="label">💬 Message:</span>
                    <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
                </div>

                <div class="highlight">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #92400e;">Next Steps:</p>
                    <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                        <li>Review the appointment details above</li>
                        <li>Check your calendar for availability</li>
                        <li>Contact client to confirm appointment</li>
                        <li>Send calendar invite if confirmed</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    This appointment request was submitted automatically from clivy.com
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

// WhatsApp appointment message template
const getAppointmentWhatsAppMessage = (data: AppointmentRequest) => {
  const formattedDate = new Date(data.preferredDate).toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return `🗓️ *APPOINTMENT REQUEST* 🗓️

⚡ *URGENT: New appointment booking!*

👤 *Client:* ${data.name}
📧 *Email:* ${data.email}
📱 *Phone:* ${data.phone}
${data.company ? `🏢 *Company:* ${data.company}\n` : ''}
🎯 *Service:* ${data.service}

📅 *Preferred Date:* ${formattedDate}
⏰ *Preferred Time:* ${data.preferredTime}

💬 *Message:*
${data.message}

---
📋 *ACTION REQUIRED:*
✅ Check calendar availability
✅ Contact client for confirmation
✅ Send calendar invite

📅 *Submitted:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
🌐 *Source:* clivy.com appointment form

_Please respond to this appointment request as soon as possible._`
}

export async function POST(request: NextRequest) {
  try {
    const body: AppointmentRequest = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.service || !body.preferredDate || !body.preferredTime || !body.message) {
      return withCORS(
        NextResponse.json({
          success: false,
          error: 'All required fields must be filled'
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

    // Validate date (must be future date)
    const appointmentDate = new Date(body.preferredDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (appointmentDate < today) {
      return withCORS(
        NextResponse.json({
          success: false,
          error: 'Appointment date must be in the future'
        }, { status: 400 })
      )
    }

    // Send email notification to admin
    const emailResult = await sendEmail({
      to: 'clivy@gmail.com',
      subject: `🗓️ URGENT: New Appointment Request from ${body.name} - ${appointmentDate.toLocaleDateString('id-ID')}`,
      html: getAppointmentEmailTemplate(body)
    })

    // Send WhatsApp notification to admin
    const whatsappResult = await sendWhatsAppMessageDetailed(
      '6281233784490', // Admin WhatsApp number
      getAppointmentWhatsAppMessage(body)
    )

    // Check if at least one notification method succeeded
    const emailSuccess = emailResult.success
    const whatsappSuccess = whatsappResult.success

    if (!emailSuccess && !whatsappSuccess) {
      console.error('Appointment request failed:', {
        email: emailResult.error,
        whatsapp: whatsappResult.error
      })
      
      return withCORS(
        NextResponse.json({
          success: false,
          error: 'Unable to send appointment request. Please try again or contact us directly.'
        }, { status: 500 })
      )
    }

    // Log partial failures but still return success
    if (!emailSuccess) {
      console.warn('Email notification failed for appointment:', emailResult.error)
    }
    if (!whatsappSuccess) {
      console.warn('WhatsApp notification failed for appointment:', whatsappResult.error)
    }

    return withCORS(
      NextResponse.json({
        success: true,
        message: 'Appointment request sent successfully! We will contact you soon to confirm your appointment.',
        notifications: {
          email: emailSuccess,
          whatsapp: whatsappSuccess
        }
      })
    )

  } catch (error) {
    console.error('Appointment API error:', error)
    
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