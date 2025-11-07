import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/public/whatsapp/packages
 * Fetch all active WhatsApp packages for customer selection
 * Public endpoint - no authentication required
 * Now only returns IDR pricing
 */
export async function GET(request: NextRequest) {
  try {
    // Get packages from database
    const packages = await prisma.whatsappApiPackage.findMany({
      orderBy: [
        { priceMonth: 'asc' } // Order by price
      ]
    });

    // Format response with calculated fields
    const formattedPackages = packages.map((pkg) => {
      // Calculate yearly discount percentage
      const monthlyYearly = pkg.priceMonth * 12;
      const yearlyDiscount = monthlyYearly > 0 
        ? ((monthlyYearly - pkg.priceYear) / monthlyYearly) * 100 
        : 0;

      return {
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        priceMonth: Number(pkg.priceMonth),
        priceYear: Number(pkg.priceYear),
        maxSession: pkg.maxSession,
        yearlyDiscount: Number(yearlyDiscount.toFixed(2)),
        // Mark middle package as recommended (Business plan usually)
        recommended: pkg.name.toLowerCase().includes('business') || pkg.name.toLowerCase().includes('profesional')
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedPackages,
      message: 'WhatsApp packages fetched successfully'
    });

  } catch (error: any) {
    console.error('[WHATSAPP_PACKAGES_API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch WhatsApp packages',
        message: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}
