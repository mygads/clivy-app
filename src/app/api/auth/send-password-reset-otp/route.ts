import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetOtpEmail } from '@/services/mailer';
import { whatsappGoService } from '@/services/whatsapp-go';
import { normalizePhoneNumber } from '@/lib/auth';
import { withCORS, corsOptionsResponse } from '@/lib/cors';

// Generate 4-digit OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST(request: Request) {
  try {
    const { identifier, method } = await request.json();

    // Validate required fields
    if (!identifier || !method) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'Email/phone and method are required',
        error: 'MISSING_FIELDS'
      }, { status: 400 }));
    }

    // Validate method
    if (!['email', 'whatsapp'].includes(method)) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'Method must be "email" or "whatsapp"',
        error: 'INVALID_METHOD'
      }, { status: 400 }));
    }

    let user;
    const isEmail = identifier.includes('@');

    // Validate identifier and method compatibility
    if (isEmail && method === 'whatsapp') {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'Cannot send WhatsApp OTP to email address',
        error: 'INCOMPATIBLE_METHOD'
      }, { status: 400 }));
    }

    if (!isEmail && method === 'email') {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'Cannot send email OTP to phone number',
        error: 'INCOMPATIBLE_METHOD'
      }, { status: 400 }));
    }    // Find user
    if (isEmail) {      user = await prisma.user.findUnique({
        where: { email: identifier },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          emailVerified: true,
          phoneVerified: true,
          resetPasswordOtp: true,
          resetPasswordOtpExpires: true,
          resetPasswordLastRequestAt: true,
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
          phoneVerified: true,
          resetPasswordOtp: true,
          resetPasswordOtpExpires: true,
          resetPasswordLastRequestAt: true,
        }
      });
    }if (!user) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'No account found with this identifier',
        error: 'USER_NOT_FOUND'
      }, { status: 404 }));
    }

    // Check if user's email/phone is verified before allowing password reset
    if (method === 'email' && !user.emailVerified) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'Email address is not verified. Please verify your email first before requesting password reset.',
        error: 'EMAIL_NOT_VERIFIED'
      }, { status: 403 }));
    }

    if (method === 'whatsapp' && !user.phoneVerified) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'Phone number is not verified. Please verify your phone number first before requesting password reset.',
        error: 'PHONE_NOT_VERIFIED'
      }, { status: 403 }));
    }    // Rate limiting - prevent spam requests (10 minute cooldown)
    if (user.resetPasswordLastRequestAt) {
      const timeSinceLastRequest = Date.now() - new Date(user.resetPasswordLastRequestAt).getTime();
      const rateLimitDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
      
      if (timeSinceLastRequest < rateLimitDuration) {
        const timeLeft = Math.ceil((rateLimitDuration - timeSinceLastRequest) / 1000);
        const minutesLeft = Math.floor(timeLeft / 60);
        const secondsLeft = timeLeft % 60;
        const timeMessage = minutesLeft > 0 
          ? `${minutesLeft} minutes and ${secondsLeft} seconds`
          : `${secondsLeft} seconds`;
        
        return withCORS(NextResponse.json({ 
          success: false,
          message: `Please wait ${timeMessage} before requesting another password reset OTP`,
          error: 'RATE_LIMITED'
        }, { status: 429 }));
      }
    }

    // Generate new OTP
    const resetPasswordOtp = generateOTP();

    // Update user with reset password OTP and track request time
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOtp,
        resetPasswordOtpExpires: new Date(Date.now() + 60 * 60 * 1000), // OTP valid for 1 hour
        resetPasswordLastRequestAt: new Date() // Track when this OTP was requested for rate limiting
      }
    });

    // Send OTP via chosen method
    if (method === 'email') {
      const emailResult = await sendPasswordResetOtpEmail(user.email!, resetPasswordOtp, user.name);
      
      if (!emailResult.success) {
        console.error('Failed to send password reset email OTP:', emailResult.error);
        return withCORS(NextResponse.json({ 
          success: false,
          message: 'Failed to send password reset email. Please try again.',
          error: 'EMAIL_SEND_FAILED'
        }, { status: 500 }));
      }

      console.log(`Password reset OTP sent successfully to email ${user.email}`);
      return withCORS(NextResponse.json({        success: true,
        message: `Password reset OTP has been sent to ${user.email}. Please check your inbox.`,
        data: {
          method: 'email',
          identifier: user.email,
          expiresIn: 60 // minutes (1 hour)
        }
      }));

    } else if (method === 'whatsapp') {
      const message = `Your password reset OTP: *${resetPasswordOtp}*

The code is valid for 1 hour.`;

      // Use system message with auto-recovery for critical password reset OTP
      const otpResult = await whatsappGoService.sendSystemMessage(user.phone!, message);
      
      if (!otpResult.success) {
        console.error(`[SEND PASSWORD RESET OTP] Failed to send WhatsApp OTP (auto-recovery attempted):`, otpResult.error);
        
        return withCORS(NextResponse.json({
          success: false,
          message: 'Failed to send password reset OTP to WhatsApp. The system will automatically retry. Please try again.',
          error: 'WHATSAPP_OTP_FAILED'
        }, { status: 503 }));
      }
      
      console.log(`Password reset OTP sent successfully to WhatsApp ${user.phone}`);
      return withCORS(NextResponse.json({
        success: true,
        message: `Password reset OTP has been sent to your WhatsApp ${user.phone}. Please check your messages.`,
        data: {
          method: 'whatsapp',
          identifier: user.phone,
          expiresIn: 60 // minutes (1 hour)
        }
      }));
    }

  } catch (error) {
    console.error('Send password reset OTP error:', error);
    return withCORS(NextResponse.json({ 
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 }));
  }
}
