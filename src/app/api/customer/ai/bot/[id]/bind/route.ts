import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerAuth } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: botId } = params;
    const body = await request.json();
    const { sessionId, isActive } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const bot = await prisma.whatsAppAIBot.findFirst({
      where: { id: botId, userId: user.id },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const waSession = await prisma.whatsAppSession.findFirst({
      where: { sessionId, userId: user.id },
    });

    if (!waSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const existingBinding = await prisma.aIBotSessionBinding.findUnique({
      where: { sessionId },
    });

    let binding;
    if (existingBinding) {
      binding = await prisma.aIBotSessionBinding.update({
        where: { sessionId },
        data: {
          botId,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    } else {
      binding = await prisma.aIBotSessionBinding.create({
        data: {
          userId: user.id,
          botId,
          sessionId,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: binding,
      message: "Bot bound to session successfully",
    });
  } catch (error) {
    console.error("Failed to bind bot to session:", error);
    return NextResponse.json({ error: "Failed to bind bot to session" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const binding = await prisma.aIBotSessionBinding.findFirst({
      where: { sessionId, userId: user.id },
    });

    if (!binding) {
      return NextResponse.json({ error: "Binding not found" }, { status: 404 });
    }

    await prisma.aIBotSessionBinding.delete({
      where: { sessionId },
    });

    return NextResponse.json({
      success: true,
      message: "Bot unbound from session successfully",
    });
  } catch (error) {
    console.error("Failed to unbind bot from session:", error);
    return NextResponse.json({ error: "Failed to unbind bot from session" }, { status: 500 });
  }
}
