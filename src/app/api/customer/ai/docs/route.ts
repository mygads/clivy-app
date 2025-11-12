import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind");
    const isActive = searchParams.get("isActive");

    const where: any = { userId: user.id };
    if (kind) where.kind = kind;
    if (isActive !== null) where.isActive = isActive === "true";

    const documents = await prisma.aIDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        kind: true,
        content: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("Failed to fetch AI documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, kind, content, isActive } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const validKinds = ["faq", "policy", "product", "pricing", "doc"];
    if (kind && !validKinds.includes(kind)) {
      return NextResponse.json(
        { error: `Kind must be one of: ${validKinds.join(", ")}` },
        { status: 400 }
      );
    }

    const document = await prisma.aIDocument.create({
      data: {
        userId: user.id,
        title,
        kind: kind || "faq",
        content,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error("Failed to create AI document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, kind, content, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const existingDoc = await prisma.aIDocument.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingDoc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const document = await prisma.aIDocument.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(kind !== undefined && { kind }),
        ...(content !== undefined && { content }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error("Failed to update AI document:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCustomerAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const existingDoc = await prisma.aIDocument.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingDoc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    await prisma.aIDocument.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete AI document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
