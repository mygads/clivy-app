import { verifyUserSession, extractTokenFromRequest } from "./jwt-session-manager";
import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

export interface UserAuthInfo {
  id: string;
  email: string;
  role: string;
  sessionId?: string;
  name?: string;
  phone?: string;
  image?: string;
  emailVerified?: Date | null;
  phoneVerified?: Date | null;
}

/**
 * Get user authentication information from JWT token
 * @param request - The request object
 * @returns User auth info or null if not authenticated
 */
export async function getUserAuth(request: Request | NextRequest): Promise<UserAuthInfo | null> {
  try {
    // Priority 1: Check JWT token in Authorization header
    if (request instanceof NextRequest || 'headers' in request) {
      const token = extractTokenFromRequest(request as NextRequest);
      if (token) {
        const sessionData = await verifyUserSession(token);
        if (sessionData) {
          return {
            id: sessionData.user.id,
            email: sessionData.user.email || '',
            role: sessionData.user.role,
            sessionId: sessionData.session.id
          };
        }
      }
    }

    // Priority 2: Check JWT token headers (set by middleware for non-NextRequest)
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');
    const sessionId = request.headers.get('x-session-id');

    if (userId) {
      return {
        id: userId,
        email: userEmail || '',
        role: userRole || 'customer',
        sessionId: sessionId || undefined
      };
    }

    return null;
  } catch (error) {
    console.error('[AUTH_HELPERS] Error getting user auth:', error);
    return null;
  }
}

/**
 * Customer-specific authentication for customer-only routes
 * Returns user info only if the user has customer role (same pattern as admin)
 * Now includes full user data (name, phone) for notifications
 */
export async function getCustomerAuth(request: Request | NextRequest): Promise<UserAuthInfo | null> {
  try {
    // Get user authentication (same as admin pattern)
    const userAuth = await getUserFromToken(request);
    
    if (!userAuth) {
      return null;
    }

    // Check if user has customer role (strict RBAC like admin)
    if (userAuth.role !== 'customer') {
      return null;
    }

    // Get full user data from database for customer operations (notifications, etc.)
    const fullUserData = await getUserFullData(userAuth.id);
    if (!fullUserData) {
      return userAuth; // Return basic auth if database fetch fails
    }

    return {
      id: fullUserData.id,
      name: fullUserData.name || undefined,
      email: fullUserData.email || '',
      phone: fullUserData.phone || undefined,
      role: fullUserData.role,
      image: fullUserData.image || undefined,
      emailVerified: fullUserData.emailVerified,
      phoneVerified: fullUserData.phoneVerified,
      sessionId: userAuth.sessionId
    };
  } catch (error) {
    console.error('[AUTH_HELPERS] Error getting customer auth:', error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') {
      // Re-throw database error to be caught as 500 upstream
      throw error;
    }
    
    return null;
  }
}

/**
 * Universal token-based authentication for /api/account routes
 * Works for all authenticated users (customer, admin, super_admin)
 */
export async function getUserFromToken(request: Request | NextRequest): Promise<UserAuthInfo | null> {
  try {
    // Check JWT token in Authorization header
    const token = extractTokenFromRequest(request as NextRequest);
    if (!token) {
      // Check JWT token headers (set by middleware for non-NextRequest)
      if ('headers' in request) {
        const userId = request.headers.get('x-user-id');
        const userEmail = request.headers.get('x-user-email');
        const userRole = request.headers.get('x-user-role');
        const sessionId = request.headers.get('x-session-id');

        if (userId) {
          return {
            id: userId,
            email: userEmail || '',
            role: userRole || 'customer',
            sessionId: sessionId || undefined
          };
        }
      }
      return null;
    }

    const sessionData = await verifyUserSession(token);
    if (!sessionData) {
      return null;
    }

    return {
      id: sessionData.user.id,
      email: sessionData.user.email || '',
      role: sessionData.user.role,
      sessionId: sessionData.session.id
    };
  } catch (error) {
    console.error('[AUTH_HELPERS] Error getting user from token:', error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') {
      // Re-throw database error to be caught as 500 upstream
      throw error;
    }
    
    return null;
  }
}

/**
 * Get detailed user authentication information with full user data
 * Used for /api/account/session endpoint
 */
export async function getDetailedUserAuth(request: Request | NextRequest): Promise<UserAuthInfo | null> {
  try {
    // Check JWT token in Authorization header
    const token = extractTokenFromRequest(request as NextRequest);
    if (!token) {
      return null;
    }

    const sessionData = await verifyUserSession(token);
    if (!sessionData) {
      return null;
    }

    // Get full user data from database
    const user = await getUserFullData(sessionData.user.id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name || undefined,
      email: user.email || '',
      phone: user.phone || undefined,
      role: user.role,
      image: user.image || undefined,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      sessionId: sessionData.session.id
    };
  } catch (error) {
    console.error('[AUTH_HELPERS] Error getting detailed user auth:', error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') {
      // Re-throw database error to be caught as 500 upstream
      throw error;
    }
    
    // For other errors, return null (will result in 401)
    return null;
  }
}

/**
 * Get full user data from database
 */
async function getUserFullData(userId: string) {
  try {
    const { prisma } = await import('./prisma');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    });
    
    // Check if user exists and is active
    if (!user || !user.isActive) {
      return null; // Return null if user doesn't exist or is deactivated
    }
    
    return user;
  } catch (error) {
    console.error('[AUTH_HELPERS] Error getting user full data:', error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && 
        (error.message.includes('Can\'t reach database server') ||
         error.message.includes('connect ECONNREFUSED') ||
         error.message.includes('ENOTFOUND') ||
         error.message.includes('timeout'))) {
      // Throw database error to be caught upstream as 500
      throw new Error('DATABASE_UNAVAILABLE');
    }
    
    return null;
  }
}

/**
 * Admin-specific authentication for admin-only routes
 * Returns user info only if the user has admin role
 */
export async function getAdminAuth(request: Request | NextRequest): Promise<UserAuthInfo | null> {
  try {
    // Get user authentication
    const userAuth = await getUserFromToken(request);
    
    if (!userAuth) {
      return null;
    }

    // Check if user has admin role
    if (userAuth.role !== 'admin' && userAuth.role !== 'super_admin') {
      return null;
    }

    return userAuth;
  } catch (error) {
    console.error('[AUTH_HELPERS] Error getting admin auth:', error);
    return null;
  }
}

/**
 * Helper function to verify admin JWT token
 * Migrated from admin-auth.ts for consistency
 */
export async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    if (decoded.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Helper function to verify user JWT token (admin or customer)
 * Migrated from admin-auth.ts for consistency
 */
export async function verifyUserToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  
  if (!token) {
    return { success: false, error: "No token provided" };
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    return { success: true, userId: decoded.id, userRole: decoded.role, userEmail: decoded.email };
  } catch (error) {
    return { success: false, error: "Invalid token" };
  }
}

/**
 * Authenticate customer request - consistent with admin pattern
 * Returns user info with customer role verification
 */
export async function authenticateCustomerRequest(request: NextRequest): Promise<UserAuthInfo | null> {
  const userAuth = await getCustomerAuth(request);
  return userAuth;
}

/**
 * Get authentication error response for customer endpoints
 */
export function getCustomerAuthErrorResponse() {
  return {
    success: false,
    error: "Customer authentication required. Please login as a customer.",
    code: "CUSTOMER_AUTH_REQUIRED"
  };
}
