import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerAuth } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    const existingBot = await prisma.whatsAppAIBot.findFirst({
      where: { id, userId: user.id },
      include: {
        aiBotSessionBindings: {
          where: { isActive: true },
          include: {
            session: true,
          },
        },
      },
    });

    if (!existingBot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Update bot status
    const bot = await prisma.whatsAppAIBot.update({
      where: { id },
      data: { isActive },
    });

    // If bot is being activated, update webhook for all bound sessions
    if (isActive && existingBot.aiBotSessionBindings.length > 0) {
      const webhookUrl = `${process.env.NEXT_PUBLIC_WHATSAPP_SERVER_API}/webhook/ai`;
      
      for (const binding of existingBot.aiBotSessionBindings) {
        if (binding.session) {
          try {
            const updateWebhookRes = await fetch(
              `${process.env.WHATSAPP_SERVER_API}/webhook`,
              {
                method: "POST",
                headers: {
                  "token": binding.session.token, // Use session's own token
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  session: binding.session.sessionId, // Use sessionId field
                  WebhookURL: webhookUrl,
                  Events: ["All"]
                }),
              }
            );
            
            if (!updateWebhookRes.ok) {
              const errorData = await updateWebhookRes.json().catch(() => ({}));
              console.error(`Failed to update webhook for session ${binding.session.token}:`, errorData);
            } else {
              const webhookData = await updateWebhookRes.json();
              if (!webhookData.success) {
                console.error(`Webhook service returned error for session ${binding.session.token}:`, webhookData);
              }
            }
          } catch (webhookError) {
            console.error(`Error updating webhook for session ${binding.session.token}:`, webhookError);
          }
        }
      }
    }

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
