import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  const interBold = await fetch(
    new URL('https://fonts.gstatic.com/s/inter/v12/UcCo3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZJhjp-Ek-_0ewXbFQ.woff')
  ).then((res) => res.arrayBuffer())

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
          background: 'linear-gradient(to right, #84cc16, #fde047, #fca5a5)',
          padding: '40px',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '72px',
          }}
        >
          ✨
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            fontSize: '72px',
          }}
        >
          ⚡️
        </div>
        
        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '82px',
              fontWeight: 900,
              background: 'linear-gradient(to right, #9333ea, #3b82f6)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '20px',
              fontFamily: 'Inter',
            }}
          >
            TOO MANY BRIDGES!!
          </h1>
          <p
            style={{
              fontSize: '36px',
              color: '#6b21a8',
              fontWeight: 'bold',
              maxWidth: '800px',
              textAlign: 'center',
              fontFamily: 'Inter',
            }}
          >
            No more scavenging for bridges. Find your perfect bridge that supports the chains you want.
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
          data: interBold,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  )
} 