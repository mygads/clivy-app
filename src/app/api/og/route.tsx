import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Genfity - Digital Solutions'
    const subtitle = searchParams.get('subtitle') || 'Software House & Digital Marketing Agency'
    const locale = searchParams.get('locale') || 'en'
    
    const isIndonesian = locale === 'id'
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e293b',
            backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          {/* Logo Area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                backgroundColor: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 24,
                color: 'white',
                fontSize: 36,
                fontWeight: 'bold',
              }}
            >
              G
            </div>
            <div
              style={{
                color: '#e2e8f0',
                fontSize: 48,
                fontWeight: 'bold',
              }}
            >
              GENFITY
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              color: 'white',
              fontSize: 54,
              fontWeight: 'bold',
              textAlign: 'center',
              maxWidth: 900,
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: '#94a3b8',
              fontSize: 28,
              textAlign: 'center',
              maxWidth: 800,
              lineHeight: 1.4,
              marginBottom: 40,
            }}
          >
            {subtitle}
          </div>

          {/* Services badges */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 20,
            }}
          >
            {[
              isIndonesian ? 'Pengembangan Website' : 'Website Development',
              'WhatsApp API',
              isIndonesian ? 'Aplikasi Mobile' : 'Mobile Apps',
              'SEO'
            ].map((service) => (
              <div
                key={service}
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                {service}
              </div>
            ))}
          </div>

          {/* Bottom border */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 8,
              backgroundColor: '#4f46e5',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('Error generating OG image:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}