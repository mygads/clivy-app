import { NextRequest } from "next/server";

/**
 * Validates internal API key from request headers
 * Used for worker-to-API communication (Go service -> Next.js)
 * 
 * Header: x-api-key: <INTERNAL_API_KEY>
 * 
 * @param request - Next.js request object
 * @returns true if valid, false otherwise
 */
export function validateInternalApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.INTERNAL_API_KEY;

  // Debug logging
  console.log("🔑 API Key Validation:");
  console.log("  - Received key:", apiKey ? `${apiKey.substring(0, 10)}...` : "null");
  console.log("  - Expected key:", expectedKey ? `${expectedKey.substring(0, 10)}...` : "null");
  console.log("  - Match:", apiKey === expectedKey);

  // If INTERNAL_API_KEY not set, allow (backward compatibility)
  if (!expectedKey) {
    console.warn("⚠️  INTERNAL_API_KEY not set - internal endpoints are unprotected!");
    return true;
  }

  // If key provided, must match
  if (!apiKey) {
    console.error("❌ No x-api-key header provided");
    return false;
  }

  const match = apiKey === expectedKey;
  if (!match) {
    console.error("❌ API key mismatch!");
    console.error("  Received length:", apiKey.length);
    console.error("  Expected length:", expectedKey.length);
  }

  return match;
}

/**
 * Check if request is from trusted internal source
 * Used for public worker endpoints that don't require customer auth
 * 
 * @param request - Next.js request object
 * @returns true if from internal source or no key required
 */
export function isInternalRequest(request: NextRequest): boolean {
  // If INTERNAL_API_KEY is set, validate it
  const expectedKey = process.env.INTERNAL_API_KEY;
  if (expectedKey) {
    return validateInternalApiKey(request);
  }

  // No key required - allow (development mode)
  return true;
}
