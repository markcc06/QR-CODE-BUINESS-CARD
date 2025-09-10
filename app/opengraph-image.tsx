import { ImageResponse } from 'next/server';
export const runtime = 'edge';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Og() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg,#0b1020,#15284a)',
          color: 'white',
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        CardSpark
      </div>
    ),
    { ...size }
  );
}