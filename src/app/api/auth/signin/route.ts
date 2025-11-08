import { NextResponse } from "next/server";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { generateUserSession, getDeviceInfoFromRequest } from '@/lib/jwt-session-manager';

export async function OPTIONS() {
  return corsOptionsResponse();
}

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: User sign in
 *     description: Authenticate user with email/phone and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email address or WhatsApp number
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sign in successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT authentication token
 *       400:
 *         description: Bad request - missing or invalid credentials
 *       401:
 *         description: Unauthorized - invalid password
 *       404:
 *         description: User not found
 */
export async function POST(request: Request) {
    try {
        const { identifier, password, role } = await request.json();

        // Validate required fields
        if (!identifier || !password) {
        return withCORS(NextResponse.json({ 
            success: false,
            message: "Email/WhatsApp number and password are required",
            error: "MISSING_CREDENTIALS"
        }, { status: 400 }));
        }

        // Determine if identifier is email or phone
        const isEmail = identifier.includes('@');
        let searchCriteria: any;

        if (isEmail) {
        // Email validation
        if (!identifier.includes('.')) {
            return withCORS(NextResponse.json({ 
            success: false,
            message: "Invalid email format",
            error: "INVALID_EMAIL_FORMAT"
            }, { status: 400 }));
        }
        searchCriteria = { email: identifier.toLowerCase() };
        } else {
        // Phone number validation and normalization
        if (!/^(\+?62|0)8[1-9][0-9]{6,10}$/.test(identifier)) {
            return withCORS(NextResponse.json({ 
            success: false,
            message: "Invalid WhatsApp number format. Use: 08xxxxxxxxx, +628xxxxxxxxx, or 628xxxxxxxxx",
            error: "INVALID_PHONE_FORMAT"
            }, { status: 400 }));
        }
        
        const normalizedPhone = normalizePhoneNumber(identifier);
        searchCriteria = { phone: normalizedPhone };
        }

        // If role is specified (admin login), add role filter
        if (role === 'admin') {
        searchCriteria.role = {
            in: ['admin', 'super_admin']
        };
        }
        
        // Always check that user is active (not deactivated by admin)
        searchCriteria.isActive = true;

        // Find user
        // console.log('Debug signin - Search criteria:', JSON.stringify(searchCriteria, null, 2));
        
        // Let's also try to find all users with similar phone numbers for debugging
        const allUsersWithPhone = await prisma.user.findMany({
            where: {
                phone: {
                    contains: "81233784490"
                }
            },
            select: {
                id: true,
                phone: true,
                email: true
            }
        });
        // console.log('Debug signin - All users with similar phone:', allUsersWithPhone);
        
        const user = await prisma.user.findFirst({
        where: searchCriteria,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            password: true,
            role: true,
            image: true,
            emailVerified: true,
            phoneVerified: true,
            isActive: true,
            createdAt: true,
        }
        });

        // console.log('Debug signin - User found:', user ? 'YES' : 'NO');
        // if (user) {
        //     console.log('Debug signin - User phone in DB:', user.phone);
        // }

        if (!user) {
        // Check if user exists but is inactive
        const inactiveSearchCriteria = { ...searchCriteria };
        delete inactiveSearchCriteria.isActive; // Remove isActive filter
        
        const inactiveUser = await prisma.user.findFirst({
            where: {
                ...inactiveSearchCriteria,
                isActive: false
            },
            select: { id: true, isActive: true }
        });
        
        if (inactiveUser) {
            return withCORS(NextResponse.json({ 
                success: false,
                message: "Your account has been deactivated by an administrator. Please contact support for assistance.",
                error: "ACCOUNT_DEACTIVATED"
            }, { status: 403 }));
        }
        
        const message = role === 'admin' 
            ? "No admin account found with this email address or insufficient privileges"
            : isEmail 
            ? "No account found with this email address" 
            : "No account found with this WhatsApp number";
        
        return withCORS(NextResponse.json({ 
            success: false,
            message,
            error: "USER_NOT_FOUND"
        }, { status: 404 }));
        }

        if (!user.password) {
        return withCORS(NextResponse.json({ 
            success: false,
            message: "Account doesn't have a password set. Please use WhatsApp verification or reset your password.",
            error: "NO_PASSWORD_SET"
        }, { status: 400 }));
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
        return withCORS(NextResponse.json({ 
            success: false,
            message: "Incorrect password",
            error: "INVALID_PASSWORD"
        }, { status: 401 }));
        }

        // Check verification status (only for customer)
        let verificationStatus = {};
        if (role !== 'admin') {
        verificationStatus = {
            emailVerified: !!user.emailVerified,
            phoneVerified: !!user.phoneVerified,
        };
        }

        // Get device info from request
        const deviceInfo = getDeviceInfoFromRequest(request as any);

        // Generate JWT session using our session manager
        const { token, sessionId, expiresAt } = await generateUserSession(user.id, deviceInfo);
        
        const responseMessage = role === 'admin' ? 'Admin login successful' : 'Sign in successful';
        
        return withCORS(NextResponse.json({
        success: true,
        message: responseMessage,
        data: {
            user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            image: user.image,
            verification: verificationStatus,
            createdAt: user.createdAt,
            },
            token
        }
        }));

    } catch (error) {
        console.error("Login error:", error);
        return withCORS(NextResponse.json({ 
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR"
        }, { status: 500 }));
    }
}
