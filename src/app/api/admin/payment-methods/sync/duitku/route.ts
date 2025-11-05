import { NextRequest, NextResponse } from "next/server";
import { withCORS, corsOptionsResponse } from "@/lib/cors";
import { withRoleAuthentication } from "@/lib/request-auth";
import { DuitkuPaymentGateway } from "@/lib/payment-gateway/duitku-gateway";
import { prisma } from "@/lib/prisma";

/**
 * DUITKU PAYMENT METHODS SYNC API
 * 
 * This endpoint syncs payment methods from Duitku API to local database.
 * It fetches available payment methods from Duitku and creates/updates
 * corresponding records in the PaymentMethod table with gateway configuration.
 * 
 * Admin only endpoint for managing payment gateway integration.
 */

// POST /api/admin/payment-methods/sync/duitku - Sync payment methods from Duitku
export async function POST(request: NextRequest) {
  const result = await withRoleAuthentication(request, ['admin'], async (userAuth) => {
    try {
      const duitkuGateway = new DuitkuPaymentGateway();

      // Check if Duitku is configured
      const isConfigured = await duitkuGateway.validateConfiguration();
      if (!isConfigured) {
        return withCORS(NextResponse.json(
          { success: false, error: "Duitku gateway is not properly configured. Please check environment variables." },
          { status: 400 }
        ));
      }

      // Get available payment methods from Duitku API
      const duitkuMethods = await duitkuGateway.getAvailablePaymentMethods();
      
      if (duitkuMethods.length === 0) {
        return withCORS(NextResponse.json(
          { success: false, error: "No payment methods found from Duitku API" },
          { status: 400 }
        ));
      }

      const syncResults = [];
      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      // Process each payment method
      for (const method of duitkuMethods) {
        try {
          const duitkuCode = `duitku_${method.code}`;
          
          // Generate payment instructions for retail methods
          let paymentInstructions = null;
          if (method.code === 'IR') {
            paymentInstructions = `Instruksi Pembayaran Indomaret:

1. Catat dan simpan Kode Pembayaran Anda
2. Datang ke Gerai retail Indomaret / Ceriamart / Lion Super Indo
3. Informasikan kepada kasir akan melakukan "Pembayaran Genfity"
4. Apabila kasir mengatakan tidak melayani pembayaran untuk "Genfity", Anda dapat menginformasikan bahwa pembayaran ini merupakan Payment Point pada Kategori "e-Commerce"
5. Tunjukkan dan berikan Kode Pembayaran ke Kasir
6. Lakukan pembayaran sesuai nominal yang diinformasikan dan tunggu proses selesai
7. Minta dan simpan struk sebagai bukti pembayaran
8. Pembayaran Anda akan langsung terdeteksi secara otomatis`;
          } else if (method.code === 'FT') {
            paymentInstructions = `Instruksi Pembayaran Alfamart Group:

1. Catat dan simpan Kode Pembayaran Anda
2. Datang ke Gerai retail (Alfamart, Kantor Pos, Pegadaian, & Dan-Dan)
3. Informasikan kepada kasir akan melakukan "Pembayaran Telkom/Indihome/Finpay"
4. Jika kasir menanyakan jenis pembayaran Telkom, pilih pembayaran untuk "Telepon Rumah" atau "Indihome atau Finpay"
5. Tunjukkan dan berikan Kode Pembayaran ke Kasir
6. Lakukan pembayaran sesuai nominal yang diinformasikan dan tunggu proses selesai
7. Minta dan simpan struk sebagai bukti pembayaran
8. Pembayaran Anda akan langsung terdeteksi secara otomatis`;
          }
          
          // Check if method already exists
          const existingMethod = await prisma.paymentMethod.findUnique({
            where: { code: duitkuCode }
          });

          if (existingMethod) {
            // Update existing method
            const updatedMethod = await prisma.paymentMethod.update({
              where: { code: duitkuCode },
              data: {
                name: method.name,
                description: `${method.name} via Duitku`,
                type: method.type,
                currency: method.currency || 'idr',
                gatewayProvider: 'duitku',
                gatewayCode: method.code,
                gatewayImageUrl: method.image || null,
                isGatewayMethod: true,
                isActive: true,
                paymentInstructions: paymentInstructions || existingMethod.paymentInstructions, // Preserve existing instructions if no new ones
                instructionType: paymentInstructions ? 'text' : existingMethod.instructionType,
                updatedAt: new Date()
              }
            });

            syncResults.push({
              code: duitkuCode,
              name: method.name,
              action: 'updated',
              id: updatedMethod.id
            });
            updatedCount++;
          } else {
            // Create new method
            const newMethod = await prisma.paymentMethod.create({
              data: {
                code: duitkuCode,
                name: method.name,
                description: `${method.name} via Duitku`,
                type: method.type,
                currency: method.currency || 'idr',
                gatewayProvider: 'duitku',
                gatewayCode: method.code,
                gatewayImageUrl: method.image || null,
                isGatewayMethod: true,
                isActive: true,
                paymentInstructions: paymentInstructions,
                instructionType: paymentInstructions ? 'text' : null,
                // No default service fee - let admin configure manually
                feeType: null,
                feeValue: null,
                minFee: null,
                maxFee: null,
                requiresManualApproval: false
              }
            });

            syncResults.push({
              code: duitkuCode,
              name: method.name,
              action: 'created',
              id: newMethod.id
            });
            createdCount++;
          }
        } catch (methodError) {
          console.error(`Error processing method ${method.code}:`, methodError);
          syncResults.push({
            code: `duitku_${method.code}`,
            name: method.name,
            action: 'error',
            error: methodError instanceof Error ? methodError.message : 'Unknown error'
          });
          skippedCount++;
        }
      }

      // Get updated statistics
      const totalMethods = await prisma.paymentMethod.count();
      const activeMethods = await prisma.paymentMethod.count({
        where: { isActive: true }
      });
      const duitkuMethodsCount = await prisma.paymentMethod.count({
        where: { gatewayProvider: 'duitku' }
      });

      const response = {
        success: true,
        data: {
          syncResults,
          summary: {
            totalProcessed: duitkuMethods.length,
            created: createdCount,
            updated: updatedCount,
            skipped: skippedCount,
            errors: syncResults.filter(r => r.action === 'error').length
          },
          statistics: {
            totalMethods,
            activeMethods,
            duitkuMethods: duitkuMethodsCount
          }
        },
        message: `Duitku sync completed: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped/errors`
      };

      console.log('[DUITKU_SYNC] Completed:', response.data.summary);

      return withCORS(NextResponse.json(response));

    } catch (error) {
      console.error("[DUITKU_SYNC_ERROR]", error);
      
      return withCORS(NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to sync Duitku payment methods" 
        },
        { status: 500 }
      ));
    }
  });

  // Handle authentication/authorization errors
  if (result && typeof result === 'object' && 'success' in result && !result.success) {
    return withCORS(NextResponse.json({
      success: false,
      error: result.error
    }, { status: result.status || 401 }))
  }

  // Return the actual response from the handler
  return result as NextResponse
}

// GET /api/admin/payment-methods/sync/duitku - Get sync status and preview
export async function GET(request: NextRequest) {
  const result = await withRoleAuthentication(request, ['admin'], async (userAuth) => {
    try {
      const duitkuGateway = new DuitkuPaymentGateway();

      // Check configuration
      const isConfigured = await duitkuGateway.validateConfiguration();
      
      // Get current Duitku methods in database
      const currentDuitkuMethods = await prisma.paymentMethod.findMany({
        where: { gatewayProvider: 'duitku' },
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          currency: true,
          gatewayCode: true,
          isActive: true,
          feeType: true,
          feeValue: true,
          createdAt: true,
          updatedAt: true
        }
      });

      let availableMethods: any[] = [];
      if (isConfigured) {
        try {
          availableMethods = await duitkuGateway.getAvailablePaymentMethods();
        } catch (error) {
          console.error('Error fetching available methods:', error);
        }
      }

      const response = {
        success: true,
        data: {
          gatewayStatus: {
            isConfigured,
            isActive: duitkuGateway.isActive,
            provider: 'duitku'
          },
          currentMethods: currentDuitkuMethods,
          availableFromGateway: availableMethods,
          syncInfo: {
            canSync: isConfigured && availableMethods.length > 0,
            currentCount: currentDuitkuMethods.length,
            availableCount: availableMethods.length,
            lastSyncNeeded: availableMethods.length !== currentDuitkuMethods.length
          }
        },
        message: isConfigured 
          ? `Found ${availableMethods.length} methods from Duitku API, ${currentDuitkuMethods.length} in database`
          : "Duitku gateway is not configured"
      };

      return withCORS(NextResponse.json(response));

    } catch (error) {
      console.error("[DUITKU_SYNC_STATUS_ERROR]", error);
      
      return withCORS(NextResponse.json(
        { 
          success: false, 
          error: "Failed to get Duitku sync status" 
        },
        { status: 500 }
      ));
    }
  });

  // Handle authentication/authorization errors
  if (result && typeof result === 'object' && 'success' in result && !result.success) {
    return withCORS(NextResponse.json({
      success: false,
      error: result.error
    }, { status: result.status || 401 }))
  }

  // Return the actual response from the handler
  return result as NextResponse
}

// PUT /api/admin/payment-methods/sync/duitku - Create default Duitku payment methods
export async function PUT(request: NextRequest) {
  const result = await withRoleAuthentication(request, ['admin'], async (userAuth) => {
    try {
      const duitkuGateway = new DuitkuPaymentGateway();

      // Check if Duitku is configured
      const isConfigured = await duitkuGateway.validateConfiguration();
      if (!isConfigured) {
        return withCORS(NextResponse.json(
          { success: false, error: "Duitku gateway is not properly configured. Please check environment variables." },
          { status: 400 }
        ));
      }

      // Create default payment methods using internal method
      const success = await duitkuGateway.createDefaultPaymentMethods();

      if (!success) {
        return withCORS(NextResponse.json(
          { success: false, error: "Failed to create default payment methods" },
          { status: 500 }
        ));
      }

      // Get updated statistics
      const duitkuMethodsCount = await prisma.paymentMethod.count({
        where: { gatewayProvider: 'duitku' }
      });

      const response = {
        success: true,
        data: {
          success,
          statistics: {
            duitkuMethods: duitkuMethodsCount
          }
        },
        message: `Default Duitku payment methods created successfully`
      };

      console.log('[DUITKU_DEFAULT_METHODS] Created successfully');

      return withCORS(NextResponse.json(response));

    } catch (error) {
      console.error("[DUITKU_DEFAULT_METHODS_ERROR]", error);
      
      return withCORS(NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : "Failed to create default Duitku payment methods" 
        },
        { status: 500 }
      ));
    }
  });

  // Handle authentication/authorization errors
  if (result && typeof result === 'object' && 'success' in result && !result.success) {
    return withCORS(NextResponse.json({
      success: false,
      error: result.error
    }, { status: result.status || 401 }))
  }

  // Return the actual response from the handler
  return result as NextResponse
}

export async function OPTIONS() {
  return corsOptionsResponse();
}
