import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Resolve session token to userId and check bot/subscription status
export async function GET(request: NextRequest) {
  try {
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
      userId: session.userId,
      sessionId: session.sessionId,
      botActive,
      subscriptionActive,
      connected: session.connected,
    });
  } catch (error) {
    console.error("Failed to resolve session:", error);
    return NextResponse.json(
      { error: "Failed to resolve session" },
      { status: 500 }
    );
  }
}
