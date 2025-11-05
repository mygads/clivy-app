import { NextRequest, NextResponse } from 'next/server';

// Public API endpoint to fetch webhook events from WhatsApp Go server
// This endpoint doesn't require authentication as it's a public resource
export async function GET(request: NextRequest) {
  // console.log('🚀 Public webhook events API called');
  
  try {
    // Use the correct environment variable from .env
    const whatsappServerApi = process.env.WHATSAPP_SERVER_API;
    
    // console.log('🔧 Environment check:', {
    //   WHATSAPP_SERVER_API: whatsappServerApi,
    //   resolved_url: whatsappServerApi
    // });
    
    if (!whatsappServerApi) {
      console.error('❌ WhatsApp Go server URL not configured in environment variables');
      return NextResponse.json({
        success: false,
        error: 'WhatsApp Go server URL not configured'
      }, { status: 500 });
    }

    const fullUrl = `${whatsappServerApi}/webhook/events`;
    // console.log('🌐 Fetching from:', fullUrl);

    // Fetch webhook events from WhatsApp Go server
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // console.log('📥 Response from WhatsApp Go server:', {
    //   status: response.status,
    //   statusText: response.statusText,
    //   ok: response.ok
    // });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch webhook events from WhatsApp Go server:', response.status, response.statusText, errorText);
      return NextResponse.json({
        success: false,
        error: `Failed to fetch webhook events from WhatsApp Go server: ${response.status} ${response.statusText}`
      }, { status: response.status });
    }

    const data = await response.json();
    // console.log('✅ Successfully fetched webhook events:', {
    //   success: data.success,
    //   active_events_count: data.data?.active_events?.length || 0,
    //   all_supported_count: data.data?.all_supported_events?.length || 0
    // });
    
    // Return the exact response from WhatsApp Go server
    return NextResponse.json(data);

  } catch (error) {
    console.error('💥 Error fetching webhook events:', error);
    return NextResponse.json({
      success: false,
      error: `Internal server error while fetching webhook events: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
