import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappGoService } from '@/services/whatsapp-go';
import { sendVerificationEmail } from '@/services/mailer';
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
    const { identifier, purpose = 'signup' } = await request.json();

    // Validate required fields
    if (!identifier) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'Identifier (email/phone) is required',
        error: 'MISSING_FIELDS'
      }, { status: 400 }));
    }    // Validate purpose and normalize format
    const validPurposes = ['signup', 'email-verification', 'password-reset', 'reset-password'];
    if (!validPurposes.includes(purpose)) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'Invalid resend purpose. Only signup, email-verification, password-reset, and reset-password are supported.',
        error: 'INVALID_PURPOSE'
      }, { status: 400 }));
    }

    // Normalize purpose format (convert reset-password to password-reset for consistency)
    const normalizedPurpose = purpose === 'reset-password' ? 'password-reset' : purpose;

    let user;
    const isEmail = identifier.includes('@');
    let normalizedPhone = '';

    // Find user based on identifier type
    if (isEmail) {      user = await prisma.user.findUnique({
        where: { email: identifier },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          // WhatsApp signup OTP fields
          otp: true,
          otpExpires: true,
          otpVerificationDeadline: true,
          // Email verification fields
          emailOtp: true,
          emailOtpExpires: true,
          emailVerificationToken: true,
          emailVerificationTokenExpires: true,
          // Password reset OTP fields
          resetPasswordOtp: true,
          resetPasswordOtpExpires: true,
          resetPasswordLastRequestAt: true,
          // Verification status
          phoneVerified: true,
          emailVerified: true,
        }
      });
    } else {      
      normalizedPhone = normalizePhoneNumber(identifier);
      user = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          // WhatsApp signup OTP fields
          otp: true,
          otpExpires: true,
          otpVerificationDeadline: true,
          // Email verification fields
          emailOtp: true,
          emailOtpExpires: true,
          emailVerificationToken: true,
          emailVerificationTokenExpires: true,
          // Password reset OTP fields
          resetPasswordOtp: true,
          resetPasswordOtpExpires: true,
          resetPasswordLastRequestAt: true,
          // Verification status
          phoneVerified: true,
          emailVerified: true,
        }
      });
    }

    if (!user) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'User not found. Please register first.',
        error: 'USER_NOT_FOUND'
      }, { status: 404 }));
    }    // Check if already verified
    if (normalizedPurpose === 'signup' && user.phoneVerified) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'Phone number already verified. You can proceed to login.',
        error: 'ALREADY_VERIFIED'
      }, { status: 400 }));
    }

    if (normalizedPurpose === 'email-verification' && user.emailVerified) {
      return withCORS(NextResponse.json({ 
        success: false,
        message: 'Email already verified.',
        error: 'ALREADY_VERIFIED'
      }, { status: 400 }));
    }

    // Handle signup OTP resend (WhatsApp)
    if (normalizedPurpose === 'signup') {
      // Check if user still within verification deadline
      if (user.otpVerificationDeadline && new Date(user.otpVerificationDeadline) < new Date()) {
        return withCORS(NextResponse.json({ 
          success: false,
          message: 'Verification deadline has passed. Please register again.',
          error: 'VERIFICATION_DEADLINE_EXPIRED'
        }, { status: 400 }));
      }

      // Generate new OTP
      const newOtp = generateOTP();
      const otpExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with new OTP
      await prisma.user.update({
        where: { id: user.id },
        data: {
          otp: newOtp,
          otpExpires: otpExpires,
        }
      });

      // Send OTP via WhatsApp using WhatsApp Go server
      const message = `Your new OTP *${newOtp}*

The code is valid for 60 minutes.`;

      console.log(`[SEND OTP] Sending WhatsApp OTP to ${user.phone} using WhatsApp Go server`);

      try {
        // Use system message with auto-recovery for critical verification OTP
        const otpResult = await whatsappGoService.sendSystemMessage(user.phone!, message);
        
        if (!otpResult.success) {
          console.error(`[SEND OTP] Failed to send WhatsApp OTP (auto-recovery attempted):`, otpResult.error);
          
          return withCORS(NextResponse.json({
            success: false,
            message: 'Failed to send verification OTP to WhatsApp. The system will automatically retry. Please try again.',
            error: 'WHATSAPP_OTP_FAILED'
          }, { status: 503 }));
        }

        console.log(`Signup OTP resent successfully to WhatsApp ${user.phone} via WhatsApp Go server`);
        return withCORS(NextResponse.json({
          success: true,
          message: `New OTP has been sent to your WhatsApp ${user.phone}. Please check your messages.`,
          data: {
            method: 'whatsapp',
            identifier: user.phone,
            expiresIn: 60 // minutes
          }
        }));
      } catch (error) {
        console.error("Resend signup OTP WhatsApp Go error:", error);
        return withCORS(NextResponse.json({
          success: false,
          message: "Failed to send OTP to WhatsApp",
          error: 'WHATSAPP_SERVICE_ERROR'
        }, { status: 500 }));
      }
    }    // Handle email verification OTP resend
    if (normalizedPurpose === 'email-verification') {
      if (!user.email) {
        return withCORS(NextResponse.json({ 
          success: false,
          message: 'No email address associated with this account.',
          error: 'NO_EMAIL'
        }, { status: 400 }));
      }

      // Generate new email OTP
      const newEmailOtp = generateOTP();
      const emailOtpExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with new email OTP
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtp: newEmailOtp,
          emailOtpExpires: emailOtpExpires,
        }
      });

      // Send email verification
      try {
        await sendVerificationEmail(user.email, user.name || 'User', newEmailOtp);
        
        console.log(`Email verification OTP resent successfully to ${user.email}`);
        return withCORS(NextResponse.json({
          success: true,
          message: `New verification OTP has been sent to your email ${user.email}. Please check your inbox.`,
          data: {
            method: 'email',
            identifier: user.email,
            expiresIn: 60 // minutes
          }
        }));
      } catch (error) {
        console.error("Resend email verification OTP error:", error);
        return withCORS(NextResponse.json({
          success: false,
          message: "Failed to send verification email",
          error: 'EMAIL_SERVICE_ERROR'
        }, { status: 500 }));      }
    }

    // Handle password reset OTP resend
    if (normalizedPurpose === 'password-reset') {
      // Rate limiting - prevent spam requests (10 minute cooldown)
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

      // Check if user has an existing valid OTP
      if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires || new Date(user.resetPasswordOtpExpires) < new Date()) {
        return withCORS(NextResponse.json({ 
          success: false,
          message: 'No active password reset request found. Please initiate a new password reset.',
          error: 'NO_ACTIVE_RESET'
        }, { status: 400 }));
      }

      // Generate new password reset OTP
      const newResetOtp = generateOTP();
      const resetOtpExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with new password reset OTP and track request time
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordOtp: newResetOtp,
          resetPasswordOtpExpires: resetOtpExpires,
          resetPasswordLastRequestAt: new Date() // Track when this OTP was requested for rate limiting
        }
      });

      // Determine method based on identifier type
      const isEmail = identifier.includes('@');
      
      if (isEmail && user.email) {
        // Send via email - import the email function
        const { sendPasswordResetOtpEmail } = await import('@/services/mailer');
        
        const emailResult = await sendPasswordResetOtpEmail(user.email, newResetOtp, user.name);
        
        if (!emailResult.success) {
          console.error('Failed to resend password reset email OTP:', emailResult.error);
          return withCORS(NextResponse.json({ 
            success: false,
            message: 'Failed to resend password reset email. Please try again.',
            error: 'EMAIL_SEND_FAILED'
          }, { status: 500 }));
        }

        console.log(`Password reset OTP resent successfully to email ${user.email}`);
        return withCORS(NextResponse.json({
          success: true,
          message: `New password reset OTP has been sent to ${user.email}. Please check your inbox.`,
          data: {
            method: 'email',
            identifier: user.email,
            expiresIn: 60 // minutes (1 hour)
          }
        }));
        
      } else if (user.phone) {
        // Send via WhatsApp using WhatsApp Go server
        const message = `Your new password reset OTP: *${newResetOtp}*

The code is valid for 1 hour.`;

        console.log(`[SEND OTP] Sending password reset OTP to ${user.phone} using WhatsApp Go server`);

        try {
          // Use system message with auto-recovery for critical password reset OTP
          const otpResult = await whatsappGoService.sendSystemMessage(user.phone, message);
          
          if (!otpResult.success) {
            console.error(`[SEND OTP] Failed to send password reset OTP (auto-recovery attempted):`, otpResult.error);
            
            return withCORS(NextResponse.json({
              success: false,
              message: 'Failed to send password reset OTP to WhatsApp. The system will automatically retry. Please try again.',
              error: 'WHATSAPP_OTP_FAILED'
            }, { status: 503 }));
          }

          console.log(`Password reset OTP resent successfully to WhatsApp ${user.phone} via WhatsApp Go server`);
          return withCORS(NextResponse.json({
            success: true,
            message: `New password reset OTP has been sent to your WhatsApp ${user.phone}. Please check your messages.`,
            data: {
              method: 'whatsapp',
              identifier: user.phone,
              expiresIn: 60 // minutes (1 hour)
            }
          }));
        } catch (error) {
          console.error("Resend password reset OTP WhatsApp Go error:", error);
          return withCORS(NextResponse.json({
            success: false,
            message: "Failed to send password reset OTP to WhatsApp",
            error: 'WHATSAPP_SERVICE_ERROR'
          }, { status: 500 }));
        }
      } else {
        return withCORS(NextResponse.json({ 
          success: false,
          message: 'No valid contact method found for this user.',
          error: 'NO_CONTACT_METHOD'
        }, { status: 400 }));
      }
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    return withCORS(NextResponse.json({ 
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 }));
  }
}
