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
    const sessionId = searchParams.get("sessionId");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = { userId: user.id };
    if (sessionId) where.sessionId = sessionId;

    const logs = await prisma.aIUsageLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        sessionId: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        latencyMs: true,
        status: true,
        errorReason: true,
        createdAt: true,
      },
    });

    const stats = await prisma.aIUsageLog.aggregate({
      where,
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        logs,
        stats: {
          totalRequests: stats._count.id,
          totalInputTokens: stats._sum.inputTokens || 0,
          totalOutputTokens: stats._sum.outputTokens || 0,
          totalTokens: stats._sum.totalTokens || 0,
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch AI usage:", error);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const internalKey = process.env.INTERNAL_API_KEY;

    if (!apiKey || !internalKey || apiKey !== internalKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, sessionId, inputTokens, outputTokens, totalTokens, latencyMs, status, errorReason } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const log = await prisma.aIUsageLog.create({
      data: {
        userId,
        sessionId: sessionId || null,
        inputTokens: inputTokens || 0,
        outputTokens: outputTokens || 0,
        totalTokens: totalTokens || 0,
        latencyMs: latencyMs || 0,
        status: status || "ok",
        errorReason: errorReason || null,
      },
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    console.error("Failed to log AI usage:", error);
    return NextResponse.json({ error: "Failed to log usage" }, { status: 500 });
  }
}
