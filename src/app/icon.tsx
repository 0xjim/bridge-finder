import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #9333ea, #3b82f6)',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            marginTop: '-2px',
          }}
        >
          ⚡️
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
