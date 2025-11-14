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

    const { id: botId } = await params;
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

    // Find session by ID (not sessionId field)
    const waSession = await prisma.whatsAppSession.findFirst({
      where: { id: sessionId, userId: user.id },
    });

    if (!waSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Update webhook URL to AI endpoint using the same pattern as webhook route
    const webhookUrl = `${process.env.NEXT_PUBLIC_WHATSAPP_SERVER_API}/webhook/ai`;
    try {
      const updateWebhookRes = await fetch(
        `${process.env.WHATSAPP_SERVER_API}/webhook`,
        {
          method: "POST",
          headers: {
            "token": waSession.token, // Use session's own token
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session: waSession.sessionId, // Use sessionId field for the session parameter
            WebhookURL: webhookUrl,
            Events: ["All"]
          }),
        }
      );
      
      if (!updateWebhookRes.ok) {
        const errorData = await updateWebhookRes.json().catch(() => ({}));
        console.error("Failed to update webhook URL:", errorData);
      } else {
        const webhookData = await updateWebhookRes.json();
        if (!webhookData.success) {
          console.error("Webhook service returned error:", webhookData);
        }
      }
    } catch (webhookError) {
      console.error("Error updating webhook:", webhookError);
      // Continue even if webhook update fails
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

    // Auto-enable autoReadMessages and typingIndicator when binding bot to session
    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: {
        autoReadMessages: true,
        typingIndicator: true,
        webhook: webhookUrl, // Also update webhook in database
      },
    });

    return NextResponse.json({
      success: true,
      data: binding,
      message: "Bot bound to session successfully. Auto-read and typing indicator enabled.",
    });
  } catch (error) {
    console.error("Failed to bind bot to session:", error);
    return NextResponse.json({ error: "Failed to bind bot to session" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await params; // Await params
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
