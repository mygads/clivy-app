import { NextResponse } from "next/server";

// Allow all origins for API access
const ALLOW_ALL_ORIGINS = process.env.API_ALLOW_ALL_ORIGINS !== "false";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8090",
].filter(Boolean);

export function withCORS(response: NextResponse, origin?: string) {
  // If ALLOW_ALL_ORIGINS is enabled, accept any origin
  if (ALLOW_ALL_ORIGINS) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
  } else {
    const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin || "*");
  }
  
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, api-key, X-Requested-With");
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
  return response;
}

export function corsOptionsResponse(origin?: string) {
  // If ALLOW_ALL_ORIGINS is enabled, accept any origin
  const allowedOrigin = ALLOW_ALL_ORIGINS 
    ? (origin || "*")
    : (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin || "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, api-key, X-Requested-With",
      "Access-Control-Max-Age": "86400", // 24 hours
    },
  });
}
