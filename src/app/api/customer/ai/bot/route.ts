import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bots = await prisma.whatsAppAIBot.findMany({
      where: { userId: user.id },
      include: {
        aiBotSessionBindings: {
          where: { isActive: true },
          select: { id: true, sessionId: true, isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bots });
  } catch (error) {
    console.error("Failed to fetch AI bots:", error);
    return NextResponse.json({ error: "Failed to fetch bots" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, systemPrompt, fallbackText, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "Bot name is required" }, { status: 400 });
    }

    const bot = await prisma.whatsAppAIBot.create({
      data: {
        userId: user.id,
        name,
        systemPrompt: systemPrompt || null,
        fallbackText: fallbackText || null,
        isActive: isActive || false,
      },
    });

    return NextResponse.json({ success: true, data: bot }, { status: 201 });
  } catch (error) {
    console.error("Failed to create AI bot:", error);
    return NextResponse.json({ error: "Failed to create bot" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, systemPrompt, fallbackText, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Bot ID is required" }, { status: 400 });
    }

    const existingBot = await prisma.whatsAppAIBot.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingBot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const bot = await prisma.whatsAppAIBot.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(fallbackText !== undefined && { fallbackText }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, data: bot });
  } catch (error) {
    console.error("Failed to update AI bot:", error);
    return NextResponse.json({ error: "Failed to update bot" }, { status: 500 });
  }
}
