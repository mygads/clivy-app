import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/services/mailer'
import { sendWhatsAppMessageDetailed } from '@/services/whatsapp-go'
import { withCORS } from '@/lib/cors'

interface CustomerServiceRequest {
  name: string
  email: string
  phone: string
  category: string
  priority: string
  subject: string
  message: string
  type?: string
}

// Customer service email template
const getCustomerServiceEmailTemplate = (data: CustomerServiceRequest) => {
  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#ef4444',
    critical: '#dc2626'
  }

  const categoryIcons = {
    technical: '🔧',
    billing: '💳',
    project: '📋',
    general: '❓'
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Customer Support Request</title>
        <style>
            body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: #23284e; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #374151; margin-bottom: 5px; display: block; }
            .value { color: #6b7280; line-height: 1.6; }
            .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .category-badge { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; background: #f3f4f6; border-radius: 6px; font-size: 14px; }
            .message-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            .urgent-banner { background: #fef2f2; border: 2px solid #fecaca; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 24px;">🛠️ New Support Request</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Customer Service - clivy.vercel.app</p>
            </div>
            
            <div class="content">
                ${data.priority === 'critical' ? `
                <div class="urgent-banner">
                    <h3 style="margin: 0 0 5px 0; color: #dc2626;">🚨 CRITICAL PRIORITY REQUEST</h3>
                    <p style="margin: 0; color: #b91c1c; font-size: 14px;">This request requires immediate attention!</p>
                </div>
                ` : ''}
                
                <div class="field">
                    <span class="label">Customer Information:</span>
                    <div class="value">
                        <strong>${data.name}</strong><br>
                        📧 ${data.email}<br>
                        📱 ${data.phone}
                    </div>
                </div>
                
                <div class="field">
                    <span class="label">Request Details:</span>
                    <div style="display: flex; gap: 15px; margin-top: 10px;">
                        <div class="category-badge">
                            ${categoryIcons[data.category as keyof typeof categoryIcons] || '❓'} ${data.category.charAt(0).toUpperCase() + data.category.slice(1)}
                        </div>
                        <div class="priority-badge" style="background: ${priorityColors[data.priority as keyof typeof priorityColors]}; color: white;">
                            ${data.priority.toUpperCase()}
                        </div>
                    </div>
                </div>
                
                <div class="field">
                    <span class="label">Subject:</span>
                    <div class="value" style="font-weight: 600; color: #374151;">${data.subject}</div>
                </div>
                
                <div class="field">
                    <span class="label">Detailed Description:</span>
                    <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
                </div>
                
                <div class="field">
                    <span class="label">Response Required:</span>
                    <div class="value">
                        ${data.priority === 'critical' ? '🚨 <strong>Immediate response required within 1 hour</strong>' :
                          data.priority === 'high' ? '⚡ Response required within 4 hours' :
                          data.priority === 'medium' ? '📅 Response required within 24 hours' :
                          '📋 Response required within 48 hours'}
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Customer Support Request - Ticket submitted at ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
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

// WhatsApp message template for customer service
const getCustomerServiceWhatsAppMessage = (data: CustomerServiceRequest) => {
  const priorityEmojis = {
    low: '🟢',
    medium: '🟡', 
    high: '🔴',
    critical: '🚨'
  }

  const categoryEmojis = {
    technical: '🔧',
    billing: '💳',
    project: '📋',
    general: '❓'
  }

  return `${data.priority === 'critical' ? '🚨🚨🚨 ' : ''}*CUSTOMER SUPPORT REQUEST*${data.priority === 'critical' ? ' 🚨🚨🚨' : ''}

👤 *Customer:* ${data.name}
📧 *Email:* ${data.email}
📱 *Phone:* ${data.phone}

${categoryEmojis[data.category as keyof typeof categoryEmojis]} *Category:* ${data.category.toUpperCase()}
${priorityEmojis[data.priority as keyof typeof priorityEmojis]} *Priority:* ${data.priority.toUpperCase()}

📋 *Subject:* ${data.subject}

💬 *Details:*
${data.message}

---
⏰ *Response Required:*
${data.priority === 'critical' ? '🚨 *IMMEDIATE* - Within 1 hour' :
  data.priority === 'high' ? '⚡ Within 4 hours' :
  data.priority === 'medium' ? '📅 Within 24 hours' :
  '📋 Within 48 hours'}

📅 *Submitted:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
🌐 *Source:* clivy.vercel.app/customer-service

${data.priority === 'critical' ? '_🚨 This is a CRITICAL support request requiring immediate attention! 🚨_' : '_This message was sent automatically from the customer service form._'}`
}

export async function POST(request: NextRequest) {
  try {
    const body: CustomerServiceRequest = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.category || !body.priority || !body.subject || !body.message) {
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

    // Validate category and priority
    const validCategories = ['technical', 'billing', 'project', 'general']
    const validPriorities = ['low', 'medium', 'high', 'critical']

    if (!validCategories.includes(body.category)) {
      return withCORS(
        NextResponse.json({
          success: false,
          error: 'Invalid support category'
        }, { status: 400 })
      )
    }

    if (!validPriorities.includes(body.priority)) {
      return withCORS(
        NextResponse.json({
          success: false,
          error: 'Invalid priority level'
        }, { status: 400 })  
      )
    }

    // Send email notification to admin
    const emailSubject = `[SUPPORT] ${body.category.toUpperCase()} - ${body.priority.toUpperCase()} - ${body.subject}`
    const emailResult = await sendEmail({
      to: 'clivy@gmail.com',
      subject: emailSubject,
      html: getCustomerServiceEmailTemplate(body)
    })

    // Send WhatsApp notification to admin
    const whatsappResult = await sendWhatsAppMessageDetailed(
      '628123456789', // Admin WhatsApp number
      getCustomerServiceWhatsAppMessage(body)
    )

    // Check if at least one notification method succeeded
    const emailSuccess = emailResult.success
    const whatsappSuccess = whatsappResult.success

    if (!emailSuccess && !whatsappSuccess) {
      console.error('Customer service form submission failed:', {
        email: emailResult.error,
        whatsapp: whatsappResult.error
      })
      
      return withCORS(
        NextResponse.json({
          success: false,
          error: 'Unable to send support request. Please try again or contact us directly.'
        }, { status: 500 })
      )
    }

    // Log partial failures but still return success
    if (!emailSuccess) {
      console.warn('Email notification failed for customer service form:', emailResult.error)
    }
    if (!whatsappSuccess) {
      console.warn('WhatsApp notification failed for customer service form:', whatsappResult.error)
    }

    return withCORS(
      NextResponse.json({
        success: true,
        message: 'Support request submitted successfully! Our team will respond according to your priority level.',
        notifications: {
          email: emailSuccess,
          whatsapp: whatsappSuccess
        },
        expectedResponse: body.priority === 'critical' ? 'within 1 hour' :
                         body.priority === 'high' ? 'within 4 hours' :
                         body.priority === 'medium' ? 'within 24 hours' :
                         'within 48 hours'
      })
    )

  } catch (error) {
    console.error('Customer service API error:', error)
    
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