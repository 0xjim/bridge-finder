import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  const interBlack = await fetch(
    new URL(
      'https://fonts.gstatic.com/s/inter/v12/UcCo3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZJhjp-Ek-_0ewXbFQ.woff'
    )
  ).then((res) => res.arrayBuffer());

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
          background: 'linear-gradient(to right, #bfff00, #fcd34d, #fda8a8)',
          padding: '40px',
          fontFamily: 'Inter',
          position: 'relative',
        }}
      >
        {/* Decorative corner elements */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            right: '30px',
            fontSize: '60px',
          }}
        >
          ✨
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '30px',
            fontSize: '60px',
          }}
        >
          ⚡️
        </div>

        {/* Main content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          {/* Large title */}
          <h1
            style={{
              fontSize: '96px',
              fontWeight: 900,
              background: 'linear-gradient(to right, #7c3aed, #3b82f6)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: '0 0 20px 0',
              lineHeight: '1',
              letterSpacing: '-2px',
            }}
          >
            HELP ME
          </h1>
          <h1
            style={{
              fontSize: '96px',
              fontWeight: 900,
              background: 'linear-gradient(to right, #7c3aed, #3b82f6)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: '0 0 30px 0',
              lineHeight: '1',
              letterSpacing: '-2px',
            }}
          >
            BRIDGE!!
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '32px',
              color: '#6b21a8',
              fontWeight: 'bold',
              maxWidth: '900px',
              textAlign: 'center',
              margin: '0',
            }}
          >
            Find the perfect bridge for your chains ⚡️
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interBlack,
          style: 'normal',
          weight: 900,
        },
      ],
    }
  );
}
