import { NextResponse } from "next/server";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { getDetailedUserAuth } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    // Get authenticated user with detailed information
    const authResult = await getDetailedUserAuth(request);
    
    if (!authResult?.id) {
      return withCORS(NextResponse.json({ 
        success: false,
        authenticated: false, 
        session: null,
        error: "Authentication required"
      }, { status: 401 }));
    }

    return withCORS(NextResponse.json({ 
      success: true,
      authenticated: true, 
      session: {
        user: {
          id: authResult.id,
          email: authResult.email,
          role: authResult.role,
          name: authResult.name,
          phone: authResult.phone,
          image: authResult.image,
          emailVerified: authResult.emailVerified,
          phoneVerified: authResult.phoneVerified
        }
      }
    }, { status: 200 }));
  } catch (error) {
    console.error("[ACCOUNT_SESSION_GET] Session validation error:", error);
    
    // Check if this is a database connectivity error
    if (error instanceof Error && error.message === 'DATABASE_UNAVAILABLE') {
      return withCORS(NextResponse.json({ 
        success: false,
        authenticated: null, // null indicates server error, not auth failure
        session: null,
        error: "Database temporarily unavailable. Please try again later.",
        code: "DATABASE_UNAVAILABLE"
      }, { status: 500 }));
    }
    
    // For other errors, return 500 (internal server error)
    return withCORS(NextResponse.json({ 
      success: false,
      authenticated: null, // null indicates server error, not auth failure
      session: null,
      error: "Session validation failed due to server error"
    }, { status: 500 }));
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
