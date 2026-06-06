import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Master Within Foundation';
    const category = searchParams.get('category') || 'Wisdom';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#11161D', // Brand dark bg
            backgroundImage: 'radial-gradient(circle at 25px 25px, #1E9AE0 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1E9AE0 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            padding: '80px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1E9AE0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '24px',
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: '60px',
              fontWeight: 'bold',
              color: '#E6EAF0',
              lineHeight: 1.2,
              maxHeight: '260px',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#C8CFDA',
              }}
            >
              masterwithin.org
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error('[og] Failed to generate OG image:', err);
    return new Response('Failed to generate image', { status: 500 });
  }
}
