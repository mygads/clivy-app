import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isInternalRequest } from "@/lib/internal-api";

// GET - Resolve session token to userId and check bot/subscription status
// This endpoint is called by Go worker, optionally protected by INTERNAL_API_KEY
export async function GET(request: NextRequest) {
  try {
    // Optional: Validate internal API key if set
    if (!isInternalRequest(request)) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token parameter is required" },
        { status: 400 }
      );
    }

    // Find session by token
    const session = await prisma.whatsAppSession.findUnique({
      where: { token },
      select: {
        userId: true,
        sessionId: true,
        connected: true,
      },
    });

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Session not found or not associated with user" },
        { status: 404 }
      );
    }

    // Check if bot is active for this session
    const botBinding = await prisma.aIBotSessionBinding.findFirst({
      where: {
        sessionId: session.sessionId,
        isActive: true,
      },
      include: {
        bot: {
          select: {
            isActive: true,
          },
        },
      },
    });

    const botActive = botBinding?.bot?.isActive || false;

    // Check subscription status
    const subscription = await prisma.servicesWhatsappCustomers.findFirst({
      where: {
        customerId: session.userId,
        status: "active",
        expiredAt: {
          gt: new Date(),
        },
      },
    });

    const subscriptionActive = !!subscription;

    return NextResponse.json({
      success: true,
      data: {
        userId: session.userId,
        sessionToken: token,
        botActive,
        subscriptionActive,
      },
    });
  } catch (error) {
    console.error("Failed to resolve session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve session" },
      { status: 500 }
    );
  }
}