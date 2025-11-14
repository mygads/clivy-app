import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerAuth } from "@/lib/auth-helpers";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, autoReadMessages, typingIndicator } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Validate at least one setting is provided
    if (autoReadMessages === undefined && typingIndicator === undefined) {
      return NextResponse.json({ error: "At least one setting must be provided" }, { status: 400 });
    }

    // Validate boolean types
    if (autoReadMessages !== undefined && typeof autoReadMessages !== "boolean") {
      return NextResponse.json({ error: "autoReadMessages must be a boolean" }, { status: 400 });
    }

    if (typingIndicator !== undefined && typeof typingIndicator !== "boolean") {
      return NextResponse.json({ error: "typingIndicator must be a boolean" }, { status: 400 });
    }

    // Verify session ownership
    const session = await prisma.whatsAppSession.findFirst({
      where: {
        sessionId: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 });
    }

    // Update settings (only update provided fields)
    const updateData: any = {};
    if (autoReadMessages !== undefined) {
      updateData.autoReadMessages = autoReadMessages;
    }
    if (typingIndicator !== undefined) {
      updateData.typingIndicator = typingIndicator;
    }

    const updatedSession = await prisma.whatsAppSession.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        sessionId: true,
        sessionName: true,
        autoReadMessages: true,
        typingIndicator: true,
        connected: true,
        loggedIn: true,
        jid: true,
        status: true,
        updatedAt: true,
      },
    });

    // Build success message
    const messages = [];
    if (autoReadMessages !== undefined) {
      messages.push(`Auto-read ${autoReadMessages ? 'enabled' : 'disabled'}`);
    }
    if (typingIndicator !== undefined) {
      messages.push(`Typing indicator ${typingIndicator ? 'enabled' : 'disabled'}`);
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedSession,
      message: messages.join(', '),
    });
  } catch (error) {
    console.error("Failed to update session settings:", error);
    return NextResponse.json({ error: "Failed to update session settings" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    // Get session with settings
    const session = await prisma.whatsAppSession.findFirst({
      where: {
        sessionId: sessionId,
        userId: user.id,
      },
      select: {
        id: true,
        sessionId: true,
        sessionName: true,
        autoReadMessages: true,
        typingIndicator: true,
        connected: true,
        loggedIn: true,
        jid: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    console.error("Failed to get session settings:", error);
    return NextResponse.json({ error: "Failed to get session settings" }, { status: 500 });
  }
}
