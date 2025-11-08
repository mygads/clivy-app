import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuth } from "@/lib/auth-helpers";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['customer', 'admin']).default('customer'),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Valid email is required").optional(),
  phone: z.string().optional(),
  role: z.enum(['customer', 'admin']).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      ));
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const whereCondition: any = {};

    // Search filter
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (role && role !== 'all') {
      whereCondition.role = role;
    }    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        include: {
          transactions: {
            include: {
              whatsappTransaction: true,
            },
          },
          whatsAppSessions: true,
          whatsappCustomers: true,
        },
        orderBy: { id: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where: whereCondition }),
    ]);const formattedUsers = users.map(user => {
      // Calculate successful WhatsApp transactions only
      const whatsappTransactions = user.transactions?.filter(t => 
        t.status === 'success' && t.whatsappTransaction
      ).length || 0;

      return {
        ...user,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
        stats: {
          totalTransactions: user.transactions?.length || 0,
          activeWhatsAppSessions: user.whatsAppSessions?.length || 0,
          whatsappServices: user.whatsappCustomers?.length || 0,
          whatsappTransactions,
        },
      };
    });

    return withCORS(NextResponse.json({
      success: true,
      data: formattedUsers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    }));
  } catch (error) {
    console.error("[USERS_GET]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    ));
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return withCORS(NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return withCORS(NextResponse.json(
        { success: false, error: validation.error.errors },
        { status: 400 }
      ));
    }

    const { name, email, phone, password, role } = validation.data;

    // Clean email - treat empty string as null
    const cleanEmail = email && email.trim() !== "" ? email : null;

    // Check if phone already exists
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return withCORS(NextResponse.json(
        { success: false, error: "User with this phone number already exists" },
        { status: 409 }
      ));
    }

    // Check if email already exists (if email is provided)
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingEmail) {
        return withCORS(NextResponse.json(
          { success: false, error: "User with this email already exists" },
          { status: 409 }
        ));
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        phone,
        password: hashedPassword,
        role,
        phoneVerified: new Date(), // Admin created users have phone auto-verified
        // Email requires manual verification by user (leave emailVerified as null)
      },      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return withCORS(NextResponse.json({
      success: true,
      data: user,
      message: "User created successfully",
    }));
  } catch (error) {
    console.error("[USERS_POST]", error);
    return withCORS(NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    ));
  }
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
