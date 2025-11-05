import { NextResponse } from "next/server";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { whatsappGoService } from "@/services/whatsapp-go";
import { sendSSOLoginOtpEmail } from "@/services/mailer";
import { normalizePhoneNumber } from "@/lib/auth";

// Generate 4-digit OTP for SSO login
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST(request: Request) {
  try {
    const { identifier, method } = await request.json();
    
    if (!identifier) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: "Email or phone number is required",
        error: 'MISSING_IDENTIFIER'
      }, { status: 400 }));
    }

    // Find user based on email or phone
    let user;
    const isEmail = identifier.includes('@');
      if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: identifier },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          ssoOtp: true,
          ssoOtpExpires: true,
          ssoLastRequestAt: true,
        }
      });
    } else {      const normalizedPhone = normalizePhoneNumber(identifier);
      user = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          ssoOtp: true,
          ssoOtpExpires: true,
          ssoLastRequestAt: true,
        }
      });
    }

    if (!user) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: "No account found with this identifier",
        error: 'USER_NOT_FOUND'
      }, { status: 404 }));
    }    // Block unverified email logins, but allow WhatsApp SSO
    if (isEmail && !user.emailVerified && method !== 'whatsapp') {
      return withCORS(NextResponse.json({ 
        success: false,
        message: "Email is not verified. Please verify your email first or use WhatsApp login.",
        error: 'EMAIL_NOT_VERIFIED'
      }, { status: 400 }));
    }    // Rate limiting - prevent spam requests (1 minute cooldown)
    if (user.ssoLastRequestAt) {
      const timeSinceLastRequest = Date.now() - new Date(user.ssoLastRequestAt).getTime();
      const rateLimitDuration = 60 * 1000; // 1 minute in milliseconds
      
      if (timeSinceLastRequest < rateLimitDuration) {
        const timeLeft = Math.ceil((rateLimitDuration - timeSinceLastRequest) / 1000);
        return withCORS(NextResponse.json({ 
          success: false,
          message: `Please wait ${timeLeft} seconds before requesting another OTP`,
          error: 'RATE_LIMITED'
        }, { status: 429 }));
      }
    }

    // Generate OTP
    const ssoOtp = generateOTP();

    // First update user with SSO OTP (valid for 1 hour) but DON'T set ssoLastRequestAt yet
    // We'll only set it after successful message sending to avoid rate limiting on failures
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ssoOtp,
        ssoOtpExpires: new Date(Date.now() + 60 * 60 * 1000), // OTP valid for 1 hour
        // Don't update ssoLastRequestAt yet - only after successful sending
      }
    });

    // Send OTP via appropriate method
    const useEmailMethod = method === 'email' || (isEmail && method !== 'whatsapp');
    
    if (useEmailMethod && user.email) {
      const emailResult = await sendSSOLoginOtpEmail(user.email, ssoOtp, user.name);
      
      if (!emailResult.success) {
        console.error('Failed to send SSO login email OTP:', emailResult.error);
        // Don't update ssoLastRequestAt on failure - allow immediate retry
        return withCORS(NextResponse.json({ 
          success: false,
          message: 'Failed to send login OTP email. Please try again.',
          error: 'EMAIL_SEND_FAILED'
        }, { status: 500 }));
      }

      // Only update rate limiting timestamp AFTER successful email sending
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ssoLastRequestAt: new Date() // Track successful OTP request for rate limiting
        }
      });

      // console.log(`SSO login OTP sent successfully to email ${user.email}`);
      return withCORS(NextResponse.json({
        success: true,
        message: `Login OTP has been sent to ${user.email}. Please check your inbox.`,
        data: {
          method: 'email',
          identifier: user.email,
          nextStep: 'VERIFY_OTP',
          expiresIn: 60 // minutes (1 hour)
        }
      }));    } else {
      // Send OTP via WhatsApp
      const message = `Your login OTP: *${ssoOtp}*

The code is valid for 1 hour.`;

      try {
        // Use system message with auto-recovery for critical SSO authentication
        const otpResult = await whatsappGoService.sendSystemMessage(user.phone!, message);
        
        if (otpResult.success) {
          // Only update rate limiting timestamp AFTER successful WhatsApp sending
          await prisma.user.update({
            where: { id: user.id },
            data: {
              ssoLastRequestAt: new Date() // Track successful OTP request for rate limiting
            }
          });

          // console.log(`SSO login OTP sent successfully to WhatsApp ${user.phone}`);
          return withCORS(NextResponse.json({
            success: true,
            message: `Login OTP has been sent to your WhatsApp ${user.phone}. Please check your messages.`,
            data: {
              method: 'whatsapp',
              identifier: user.phone,
              nextStep: 'VERIFY_OTP',
              expiresIn: 60 // minutes (1 hour)
            }
          }));
        } else {
          // DON'T update ssoLastRequestAt on WhatsApp failure - allow immediate retry
          // This prevents rate limiting when WhatsApp server has issues

          console.error(`SSO login OTP failed for WhatsApp ${user.phone}:`, otpResult.error);
          
          return withCORS(NextResponse.json({
            success: false,
            message: 'Failed to send OTP to WhatsApp. The system will automatically retry. Please try again in a few moments.',
            error: 'WHATSAPP_OTP_FAILED',
            details: otpResult.error || 'WhatsApp delivery failed, auto-recovery attempted'
          }, { status: 503 }));
        }
      } catch (error) {
        console.error("SSO OTP WhatsApp error:", error);
        return withCORS(NextResponse.json({
          success: false,
          message: "Failed to send OTP to WhatsApp",
          error: 'WHATSAPP_SERVICE_ERROR'
        }, { status: 500 }));
      }
    }
  } catch (error) {
    console.error("SSO signin error:", error);
    return withCORS(NextResponse.json({ 
      success: false,
      message: "Internal server error",
      error: 'INTERNAL_ERROR'
    }, { status: 500 }));
  }
}
