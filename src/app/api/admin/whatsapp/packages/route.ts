import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// GET /api/admin/whatsapp/packages
export async function GET(request: NextRequest) {
  try {
    // console.log('[WhatsApp Packages API] GET request received');
    
    const adminAuth = await getAdminAuth(request);
    // console.log('[WhatsApp Packages API] Admin auth result:', adminAuth ? 'Valid' : 'Invalid');
    
    if (!adminAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const packages = await prisma.whatsappApiPackage.findMany({
      orderBy: { priceMonth_idr: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        priceMonth_idr: true,
        priceMonth_usd: true,
        priceYear_idr: true,
        priceYear_usd: true,
        maxSession: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: packages 
    });
  } catch (error) {
    console.error('Error fetching WhatsApp packages:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST /api/admin/whatsapp/packages
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, priceMonth_idr, priceMonth_usd, priceYear_idr, priceYear_usd, maxSession } = body;
    
    if (!name || !priceMonth_idr || !priceMonth_usd || !priceYear_idr || !priceYear_usd || !maxSession) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, priceMonth_idr, priceMonth_usd, priceYear_idr, priceYear_usd, and maxSession are required' 
      }, { status: 400 });
    }

    const created = await prisma.whatsappApiPackage.create({
      data: {
        name,
        description: description || null,
        priceMonth_idr: Number(priceMonth_idr),
        priceMonth_usd: Number(priceMonth_usd),
        priceYear_idr: Number(priceYear_idr),
        priceYear_usd: Number(priceYear_usd),
        maxSession: Number(maxSession),
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: created 
    });
  } catch (error) {
    console.error('Error creating WhatsApp package:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
