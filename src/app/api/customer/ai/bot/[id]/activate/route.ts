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

    const { id } = params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    const existingBot = await prisma.whatsAppAIBot.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingBot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const bot = await prisma.whatsAppAIBot.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      data: bot,
      message: `Bot ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Failed to toggle bot status:", error);
    return NextResponse.json({ error: "Failed to toggle bot status" }, { status: 500 });
  }
}
