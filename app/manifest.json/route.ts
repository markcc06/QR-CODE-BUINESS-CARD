import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    name: "CardSpark",
    short_name: "CardSpark",
    description: "Generate beautiful QR code business cards",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    icons: [
      {
        "src": "/icons/icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  });
}