import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get bot settings for AI worker
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionToken = searchParams.get("sessionToken");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    // Get session to find binding
    let sessionId: string | null = null;
    if (sessionToken) {
      const session = await prisma.whatsAppSession.findUnique({
        where: { token: sessionToken },
        select: { sessionId: true },
      });
      sessionId = session?.sessionId || null;
    }

    // Find bot binding for this session
    let botId: string | null = null;
    if (sessionId) {
      const binding = await prisma.aIBotSessionBinding.findFirst({
        where: { sessionId, isActive: true },
        select: { botId: true },
      });
      botId = binding?.botId || null;
    }

    // If no specific bot bound, get user's default active bot
    let bot;
    if (botId) {
      bot = await prisma.whatsAppAIBot.findUnique({
        where: { id: botId },
      });
    } else {
      bot = await prisma.whatsAppAIBot.findFirst({
        where: { userId, isActive: true },
        orderBy: { createdAt: "desc" },
      });
    }

    // Get documents for this user
    const documents = await prisma.aIDocument.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        title: true,
        content: true,
        kind: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const systemPrompt =
      bot?.systemPrompt ||
      "Anda adalah customer service yang ramah dan profesional.";
    const fallbackText =
      bot?.fallbackText ||
      "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";

    return NextResponse.json({
      systemPrompt,
      fallbackText,
      documents,
    });
  } catch (error) {
    console.error("Failed to fetch bot settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bot settings" },
      { status: 500 }
    );
  }
}
