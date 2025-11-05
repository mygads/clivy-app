import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/whatsapp/packages/[id] - Alternative to PATCH
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PATCH(request, { params });
}

// PATCH /api/admin/whatsapp/packages/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, priceMonth_idr, priceMonth_usd, priceYear_idr, priceYear_usd, maxSession } = body;
    
    if (!name || !priceMonth_idr || !priceMonth_usd || !priceYear_idr || !priceYear_usd || !maxSession) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, priceMonth_idr, priceMonth_usd, priceYear_idr, priceYear_usd, and maxSession are required' 
      }, { status: 400 });
    }

    const updated = await prisma.whatsappApiPackage.update({
      where: { id },
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
      data: updated 
    });
  } catch (error) {
    console.error('Error updating WhatsApp package:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE /api/admin/whatsapp/packages/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminAuth = await getAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.whatsappApiPackage.delete({ 
      where: { id } 
    });

    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Error deleting WhatsApp package:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
