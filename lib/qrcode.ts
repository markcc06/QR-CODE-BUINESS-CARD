export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export async function generateQRCode(
  text: string, 
  size: number = 200,
  errorCorrection: ErrorCorrectionLevel = 'M'
): Promise<string> {
  // Using qr-server.com API for QR generation
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: text,
    ecc: errorCorrection.toLowerCase()
  });
  
  const url = `https://api.qrserver.com/v1/create-qr-code/?${params}`;
  return url;
}

export function downloadQRCode(dataUrl: string, filename: string = 'qrcode.png') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}