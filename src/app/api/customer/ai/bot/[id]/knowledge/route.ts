import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerAuth } from "@/lib/auth-helpers";

// POST /api/customer/ai/bot/:id/knowledge - Bind multiple knowledge bases to bot
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const botId = params.id;
    const body = await request.json();
    const { documentIds } = body; // Array of document IDs

    if (!Array.isArray(documentIds)) {
      return NextResponse.json(
        { error: "documentIds must be an array" },
        { status: 400 }
      );
    }

    // Verify bot ownership
    const bot = await prisma.whatsAppAIBot.findFirst({
      where: { id: botId, userId: user.id },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Verify all documents belong to user
    const documents = await prisma.aIDocument.findMany({
      where: {
        id: { in: documentIds },
        userId: user.id,
      },
    });

    if (documents.length !== documentIds.length) {
      return NextResponse.json(
        { error: "Some documents not found or unauthorized" },
        { status: 400 }
      );
    }

    // First, deactivate all existing bindings for this bot
    await prisma.botKnowledgeBinding.updateMany({
      where: { botId },
      data: { isActive: false },
    });

    // Create new bindings (or reactivate if exists)
    const bindings = await Promise.all(
      documentIds.map(async (docId) => {
        // Try to find existing binding
        const existing = await prisma.botKnowledgeBinding.findUnique({
          where: {
            botId_documentId: {
              botId,
              documentId: docId,
            },
          },
        });

        if (existing) {
          // Reactivate existing binding
          return prisma.botKnowledgeBinding.update({
            where: { id: existing.id },
            data: { isActive: true },
          });
        } else {
          // Create new binding
          return prisma.botKnowledgeBinding.create({
            data: {
              botId,
              documentId: docId,
              isActive: true,
            },
          });
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: `Bound ${bindings.length} knowledge bases to bot`,
      data: bindings,
    });
  } catch (error) {
    console.error("Failed to bind knowledge bases:", error);
    return NextResponse.json(
      { error: "Failed to bind knowledge bases" },
      { status: 500 }
    );
  }
}

// DELETE /api/customer/ai/bot/:id/knowledge - Unbind knowledge base from bot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const botId = params.id;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId query parameter required" },
        { status: 400 }
      );
    }

    // Verify bot ownership
    const bot = await prisma.whatsAppAIBot.findFirst({
      where: { id: botId, userId: user.id },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Deactivate binding
    const binding = await prisma.botKnowledgeBinding.updateMany({
      where: {
        botId,
        documentId,
      },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Knowledge base unbound from bot",
    });
  } catch (error) {
    console.error("Failed to unbind knowledge base:", error);
    return NextResponse.json(
      { error: "Failed to unbind knowledge base" },
      { status: 500 }
    );
  }
}
